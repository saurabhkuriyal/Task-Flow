"use client";

import * as React from "react";
import { MemberToolbar } from "./MemberToolbar";
import { MemberTable } from "./MemberTable";
import { AddMemberModal } from "./AddMemberModal";
import { useMembers } from "@/hooks/member";

export function MemberView() {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredMembers,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    refetch,
    currentOrgId,
  } = useMembers();

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
      <MemberToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddMember={openAddModal}
      />
      <MemberTable isLoading={isLoading} members={filteredMembers} />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={refetch}
        organisationId={currentOrgId}
      />
    </div>
  );
}

export default MemberView;
