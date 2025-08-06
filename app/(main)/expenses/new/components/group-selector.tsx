"use client";

import { useState, useEffect } from "react";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { BarLoader } from "react-spinners";
import { Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type definitions
interface Participant {
  id: Id<"users">;
  name: string;
  email: string;
  imageUrl?: string;
}

interface Group {
  id: Id<"groups">;
  name: string;
  description?: string;
  members: Participant[];
}

interface GroupListItem {
  id: Id<"groups">;
  name: string;
  memberCount: number;
}

interface GroupQueryData {
  groups?: GroupListItem[];
  selectedGroup?: Group;
}

interface GroupSelectorProps {
  onChange: (group: Group) => void;
}

export function GroupSelector({
  onChange,
}: GroupSelectorProps): React.JSX.Element {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Single query to get all data we need
  const { data, isLoading } = useConvexQuery(
    api.groups.getGroupOrMembers,
    selectedGroupId ? { groupId: selectedGroupId } : {}
  ) as { data: GroupQueryData | null; isLoading: boolean };

  // When group data changes, notify parent
  useEffect(() => {
    if (data?.selectedGroup && onChange) {
      onChange(data.selectedGroup);
    }
  }, [data, onChange]);

  const handleGroupChange = (groupId: string): void => {
    setSelectedGroupId(groupId);
  };

  if (isLoading) {
    return <BarLoader width={"100%"} color="#36d7b7" />;
  }

  if (!data?.groups || data.groups.length === 0) {
    return (
      <div className="text-sm text-amber-600 p-2 bg-amber-50 rounded-md">
        You need to create a group first before adding a group expense.
      </div>
    );
  }

  return (
    <div>
      <Select value={selectedGroupId} onValueChange={handleGroupChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a group" />
        </SelectTrigger>
        <SelectContent>
          {data &&
            data.groups &&
            data.groups.map((group: GroupListItem) => (
              <SelectItem key={group.id} value={group.id}>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span>{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({group.memberCount} members)
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {isLoading && selectedGroupId && (
        <div className="mt-2">
          <BarLoader width={"100%"} color="#36d7b7" />
        </div>
      )}
    </div>
  );
}
