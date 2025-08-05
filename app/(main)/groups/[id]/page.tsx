"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ArrowLeftRight, ArrowLeft, Users } from "lucide-react";
import { ExpenseList } from "@/components/expense-list";
// import { SettlementList } from "@/components/settlements-list";
// import { GroupBalances } from "@/components/group-balances";
// import { GroupMembers } from "@/components/group-members";

// Type definitions
interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

interface Expense {
  _id: Id<"expenses">;
  description: string;
  amount: number;
  category?: string;
  date: number;
  paidByUserId: string;
  splitType: string;
  splits: ExpenseSplit[];
  groupId?: Id<"groups">;
  createdBy: string;
}

interface Settlement {
  _id: Id<"settlements">;
  amount: number;
  date: number;
  paidByUserId: string;
  receivedByUserId: string;
  groupId?: Id<"groups">;
  relatedExpenseIds?: Id<"expenses">[];
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

interface GroupInfo {
  id: Id<"groups">;
  name: string;
  description?: string;
}

interface UserLookupMap {
  [userId: string]: MemberDetail;
}

interface GroupExpensesData {
  group: GroupInfo;
  members: MemberDetail[];
  expenses: Expense[];
  settlements: Settlement[];
  balances: Balance[];
  userLookupMap: UserLookupMap;
}

export default function GroupExpensesPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("expenses");

  const { data, isLoading } = useConvexQuery(api.groups.getGroupExpenses, {
    groupId: params.id as Id<"groups">,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  // Type the data with proper assertion and provide defaults
  const typedData = data as GroupExpensesData | undefined;
  const group = typedData?.group;
  const members = typedData?.members || [];
  const expenses = typedData?.expenses || [];
  const settlements = typedData?.settlements || [];
  const balances = typedData?.balances || [];
  const userLookupMap = typedData?.userLookupMap || {};

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-4 rounded-md">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl gradient-title">{group?.name}</h1>
              <p className="text-muted-foreground">{group?.description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {members.length} members
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/settlements/group/${params.id}`}>
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Settle up
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/expenses/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add expense
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid layout for group details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Create GroupBalances component */}
              <div className="space-y-3">
                {balances.length === 0 ? (
                  <p className="text-muted-foreground">
                    No balance information available
                  </p>
                ) : (
                  balances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <span className="font-medium">{balance.name}</span>
                      <span
                        className={`font-bold ${balance.totalBalance >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        ${Math.abs(balance.totalBalance).toFixed(2)}
                        {balance.totalBalance >= 0 ? " owed" : " owes"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Members</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Create GroupMembers component */}
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-muted-foreground">No members found</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={member.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for expenses and settlements */}
      <Tabs
        defaultValue="expenses"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">
            Expenses ({expenses.length})
          </TabsTrigger>
          <TabsTrigger value="settlements">
            Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseList
            expenses={expenses}
            showOtherPerson={true}
            isGroupExpense={true}
            userLookupMap={userLookupMap}
          />
        </TabsContent>

        <TabsContent value="settlements" className="space-y-4">
          {/* TODO: Create SettlementList component */}
          <Card>
            <CardHeader>
              <CardTitle>Settlements</CardTitle>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <p className="text-muted-foreground">No settlements found</p>
              ) : (
                <div className="space-y-2">
                  {settlements.map((settlement) => (
                    <div
                      key={settlement._id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">Settlement</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(settlement.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold">
                        ${settlement.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
