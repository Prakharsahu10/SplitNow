import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

// Type definitions
interface GroupMember {
  userId: string;
  role: string;
  joinedAt: number;
}

interface UserGroup {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: GroupMember[];
  memberCount: number;
  totalExpenses: number;
  balanceStatus: string;
  id: string;
  balance: number;
}

interface GroupListProps {
  groups: UserGroup[] | undefined;
}

export function GroupList({ groups }: GroupListProps): React.JSX.Element {
  if (!groups || groups.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No groups yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create a group to start tracking shared expenses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group: UserGroup) => {
        // Calculate total balance in the group
        const balance: number = group.balance || 0;
        const hasBalance: boolean = balance !== 0;

        return (
          <Link
            href={`/groups/${group.id}`}
            key={group.id}
            className="flex items-center justify-between hover:bg-muted p-2 rounded-md transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{group.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.members.length} members
                </p>
              </div>
            </div>

            {hasBalance && (
              <span
                className={`text-sm font-medium ${
                  balance > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {balance > 0 ? "+" : ""}${balance.toFixed(2)}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
