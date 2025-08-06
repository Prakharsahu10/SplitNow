"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { BarLoader } from "react-spinners";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users } from "lucide-react";
import React from "react";

// Dynamic import with type assertion for SettlementForm
const SettlementForm = React.lazy(() => import("./components/settlement-form"));

// Type definitions to match SettlementForm component expectations
interface UserData {
  userId: Id<"users">;
  name: string;
  email: string;
  imageUrl?: string;
}

interface GroupBalance {
  userId: Id<"users">;
  name: string;
  imageUrl?: string;
  youAreOwed: number;
  youOwe: number;
  netBalance: number;
}

interface UserEntityData {
  type: "user";
  counterpart: UserData;
  youAreOwed: number;
  youOwe: number;
  netBalance: number;
}

interface GroupEntityData {
  type: "group";
  group: {
    id: Id<"groups">;
    name: string;
    description?: string;
  };
  balances: GroupBalance[];
}

type EntityData = UserEntityData | GroupEntityData;

interface RouteParams {
  type: string;
  id: string;
  [key: string]: string | string[] | undefined;
}

export default function SettlementPage(): React.JSX.Element {
  const params = useParams<RouteParams>();
  const router = useRouter();
  const { type, id } = params;

  // Type validation for entity type
  const entityType: "user" | "group" =
    type === "user" || type === "group" ? type : "user";

  // Use the actual settlements API
  const { data, isLoading } = useConvexQuery(
    api.settlements.getSettlementData,
    {
      entityType: entityType,
      entityId: id,
    }
  );

  // Type guard to handle null data - data should match the return type from getSettlementData
  const settlementData = data as EntityData | null;

  // The data from the API is already in the EntityData format
  const entityData = settlementData;

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <BarLoader width={"100%"} color="#36d7b7" />
      </div>
    );
  }

  // Function to handle after successful settlement creation
  const handleSuccess = (): void => {
    // Redirect based on type
    if (entityType === "user") {
      router.push(`/person/${id}`);
    } else if (entityType === "group") {
      router.push(`/groups/${id}`);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-lg">
      <Button
        variant="outline"
        size="sm"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-5xl gradient-title">Record a settlement</h1>
        <p className="text-muted-foreground mt-1">
          {entityType === "user"
            ? `Settling up with ${
                settlementData?.type === "user"
                  ? settlementData.counterpart.name
                  : "Unknown user"
              }`
            : `Settling up in ${
                settlementData?.type === "group"
                  ? settlementData.group.name
                  : "Unknown group"
              }`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {entityType === "user" ? (
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    settlementData?.type === "user"
                      ? settlementData.counterpart.imageUrl
                      : undefined
                  }
                />
                <AvatarFallback>
                  {settlementData?.type === "user"
                    ? settlementData.counterpart.name?.charAt(0) || "?"
                    : "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="bg-primary/10 p-2 rounded-md">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardTitle>
              {entityType === "user"
                ? settlementData?.type === "user"
                  ? settlementData.counterpart.name
                  : "Unknown User"
                : settlementData?.type === "group"
                  ? settlementData.group.name
                  : "Unknown Group"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <React.Suspense fallback={<div>Loading settlement form...</div>}>
            <SettlementForm
              entityType={entityType}
              entityData={entityData}
              onSuccess={handleSuccess}
            />
          </React.Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
