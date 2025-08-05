import { query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Type definitions
interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  imageUrl?: string;
  tokenIdentifier: string;
}

interface GroupMember {
  userId: Id<"users">;
  role: string;
  joinedAt: number;
}

interface Group {
  _id: Id<"groups">;
  name: string;
  description?: string;
  createdBy: Id<"users">;
  members: GroupMember[];
}

interface MemberDetail {
  id: Id<"users">;
  name: string;
  email?: string;
  imageUrl?: string;
  role: string;
}

interface Balance {
  id: Id<"users">;
  name: string;
  imageUrl?: string;
  role: string;
  totalBalance: number;
  owes: Array<{ to: string; amount: number }>;
  owedBy: Array<{ from: Id<"users">; amount: number }>;
}

interface Ledger {
  [userId: string]: { [otherUserId: string]: number };
}

interface UserLookupMap {
  [userId: string]: MemberDetail;
}

export const getGroupOrMembers = query({
  args: {
    groupId: v.optional(v.id("groups")), // Optional - if provided, will return details for just this group
  },
  handler: async (ctx: QueryCtx, args) => {
    // Get current user using auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get all groups where the user is a member
    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === currentUser._id)
    );

    // If a specific group ID is provided, only return details for that group
    if (args.groupId) {
      const selectedGroup = userGroups.find(
        (group) => group._id === args.groupId
      );

      if (!selectedGroup) {
        throw new Error("Group not found or you're not a member");
      }

      // Get all user details for this group's members
      const memberDetails = await Promise.all(
        selectedGroup.members.map(async (member) => {
          const user = await ctx.db.get(member.userId);
          if (!user) return null;

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            role: member.role,
          };
        })
      );

      // Filter out any null values (in case a user was deleted)
      const validMembers = memberDetails.filter((member) => member !== null);

      // Return selected group with member details
      return {
        selectedGroup: {
          id: selectedGroup._id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          createdBy: selectedGroup.createdBy,
          members: validMembers,
        },
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    } else {
      // Just return the list of groups without member details
      return {
        selectedGroup: null,
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    }
  },
});

// Get expenses for a specific group
export const getGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx: QueryCtx, { groupId }) => {
    // Get current user using auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    if (!group.members.some((m) => m.userId === currentUser._id))
      throw new Error("You are not a member of this group");

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    /* ----------  member map ---------- */
    const memberDetails: MemberDetail[] = await Promise.all(
      group.members.map(async (m): Promise<MemberDetail> => {
        const u = await ctx.db.get(m.userId);
        if (!u) {
          throw new Error(`User not found: ${m.userId}`);
        }
        return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
      })
    );
    const ids: Id<"users">[] = memberDetails.map((m) => m.id);

    /* ----------  ledgers ---------- */
    // total net balance (old behaviour)
    const totals: Record<string, number> = Object.fromEntries(
      ids.map((id) => [id, 0])
    );
    // pair‑wise ledger  debtor -> creditor -> amount
    const ledger: Ledger = {};
    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    /* ----------  apply expenses ---------- */
    for (const exp of expenses) {
      const payer = exp.paidByUserId;
      for (const split of exp.splits) {
        if (split.userId === payer || split.paid) continue; // skip payer & settled
        const debtor = split.userId;
        const amt = split.amount;

        totals[payer] += amt;
        totals[debtor] -= amt;

        ledger[debtor][payer] += amt; // debtor owes payer
      }
    }

    /* ----------  apply settlements ---------- */
    for (const s of settlements) {
      totals[s.paidByUserId] += s.amount;
      totals[s.receivedByUserId] -= s.amount;

      ledger[s.paidByUserId][s.receivedByUserId] -= s.amount; // they paid back
    }

    /* ----------  net the pair‑wise ledger ---------- */
    ids.forEach((a) => {
      ids.forEach((b) => {
        if (a >= b) return; // visit each unordered pair once
        const diff = ledger[a][b] - ledger[b][a];
        if (diff > 0) {
          ledger[a][b] = diff;
          ledger[b][a] = 0;
        } else if (diff < 0) {
          ledger[b][a] = -diff;
          ledger[a][b] = 0;
        } else {
          ledger[a][b] = ledger[b][a] = 0;
        }
      });
    });

    /* ----------  shape the response ---------- */
    const balances: Balance[] = memberDetails.map((m) => ({
      ...m,
      totalBalance: totals[m.id],
      owes: Object.entries(ledger[m.id])
        .filter(([, v]: [string, unknown]) => (v as number) > 0)
        .map(([to, amount]) => ({ to, amount: amount as number })),
      owedBy: ids
        .filter((other) => ledger[other][m.id] > 0)
        .map((other) => ({ from: other, amount: ledger[other][m.id] })),
    }));

    const userLookupMap: UserLookupMap = {};
    memberDetails.forEach((member) => {
      userLookupMap[member.id] = member;
    });

    return {
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
      },
      members: memberDetails,
      expenses,
      settlements,
      balances,
      userLookupMap,
    };
  },
});
