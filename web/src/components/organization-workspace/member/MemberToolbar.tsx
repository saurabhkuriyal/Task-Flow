"use client";

import * as React from "react";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface MemberToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddMember?: () => void;
}

export function MemberToolbar({
  searchTerm,
  onSearchChange,
  onAddMember,
}: MemberToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onAddMember}
        className="h-9 gap-1.5 cursor-pointer"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Member</span>
      </Button>
    </div>
  );
}

export default MemberToolbar;
