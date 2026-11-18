"use client";

import * as React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  RotateCw,
  X,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types/auth";
import { cn } from "@/lib/utils";

export interface MemberTableProps {
  isLoading?: boolean;
  members?: User[];
  onViewDetails?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChangeStatus?: (user: User, newStatus: "Active" | "Inactive") => void;
}

export function MemberTable({
  isLoading = false,
  members = [],
  onViewDetails,
  onEdit,
  onDelete,
  onChangeStatus,
}: MemberTableProps) {
  // Local state for actions
  const [statusMap, setStatusMap] = React.useState<Record<string, "Active" | "Inactive">>({});
  const [deletedIds, setDeletedIds] = React.useState<string[]>([]);
  const [editedUsers, setEditedUsers] = React.useState<Record<string, Partial<User>>>({});

  // Dialog states
  const [detailsUser, setDetailsUser] = React.useState<User | null>(null);
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [deleteUser, setDeleteUser] = React.useState<User | null>(null);

  // Edit form inputs
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editRole, setEditRole] = React.useState("employee");

  // Filter out locally deleted members & apply edits
  const displayedMembers = React.useMemo(() => {
    return members
      .filter((u) => {
        const id = u.id || u._id || u.email;
        return !deletedIds.includes(id);
      })
      .map((u) => {
        const id = u.id || u._id || u.email;
        const overrides = editedUsers[id];
        return overrides ? { ...u, ...overrides } : u;
      });
  }, [members, deletedIds, editedUsers]);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const formatDate = (dateValue?: string | Date) => {
    if (!dateValue) return "Recently";
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // Status toggle handler
  const handleToggleStatus = (user: User) => {
    const id = user.id || user._id || user.email;
    const currentStatus = statusMap[id] || "Active";
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setStatusMap((prev) => ({ ...prev, [id]: nextStatus }));
    onChangeStatus?.(user, nextStatus);
  };

  // Details handler
  const handleOpenDetails = (user: User) => {
    setDetailsUser(user);
    onViewDetails?.(user);
  };

  // Edit handler
  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditPhone(user.phoneNumber || "");
    setEditRole(user.role || "employee");
    onEdit?.(user);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const id = editUser.id || editUser._id || editUser.email;
    setEditedUsers((prev) => ({
      ...prev,
      [id]: {
        name: editName.trim(),
        phoneNumber: editPhone.trim(),
        role: editRole,
      },
    }));
    setEditUser(null);
  };

  // Delete handler
  const handleOpenDelete = (user: User) => {
    setDeleteUser(user);
  };

  const handleConfirmDelete = () => {
    if (!deleteUser) return;
    const id = deleteUser.id || deleteUser._id || deleteUser.email;
    setDeletedIds((prev) => [...prev, id]);
    onDelete?.(deleteUser);
    setDeleteUser(null);
  };

  return (
    <>
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                // Shadow loading skeleton rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex justify-end gap-1.5">
                        <Skeleton className="h-7 w-16 rounded-md" />
                        <Skeleton className="h-7 w-14 rounded-md" />
                        <Skeleton className="h-7 w-16 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : displayedMembers.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-muted-foreground">
                    No members found in this organization.
                  </td>
                </tr>
              ) : (
                // Populated rows
                displayedMembers.map((user) => {
                  const userId = user.id || user._id || user.email;
                  const roleName = user.role || "employee";
                  const currentStatus = statusMap[userId] || "Active";

                  return (
                    <tr key={userId} className="hover:bg-muted/30 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(user.name, user.email)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-xs uppercase tracking-wider font-medium">
                          {roleName}
                        </Badge>
                      </td>

                      {/* Status + Change Status Button */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-medium",
                              currentStatus === "Active"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-zinc-500 dark:text-zinc-400"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                currentStatus === "Active" ? "bg-emerald-500" : "bg-zinc-400"
                              )}
                            />
                            {currentStatus}
                          </span>

                          {/* Button to Change Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted px-1.5 py-0.5 rounded border border-border/60 transition-colors cursor-pointer"
                            title="Click to toggle status between Active and Inactive"
                          >
                            <RotateCw className="h-2.5 w-2.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Action Buttons: Details, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Details Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenDetails(user)}
                            className="h-7 px-2 text-xs gap-1 cursor-pointer"
                            title="View member details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>

                          {/* Edit Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleOpenEdit(user)}
                            className="h-7 px-2 text-xs gap-1 cursor-pointer"
                            title="Edit member"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>

                          {/* Delete Button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            onClick={() => handleOpenDelete(user)}
                            className="h-7 px-2 text-xs gap-1 cursor-pointer"
                            title="Delete member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. DETAILS MODAL */}
      {detailsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Member Details</h3>
                  <p className="text-xs text-muted-foreground">Full member profile and access summary</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  Full Name
                </span>
                <span className="font-semibold text-foreground">{detailsUser.name}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </span>
                <span className="font-semibold text-foreground">{detailsUser.email}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number
                </span>
                <span className="font-semibold text-foreground">
                  {detailsUser.phoneNumber || "Not provided"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Role
                </span>
                <Badge variant="outline" className="uppercase text-[11px]">
                  {detailsUser.role || "employee"}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined Date
                </span>
                <span className="font-medium text-foreground">{formatDate(detailsUser.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {statusMap[detailsUser.id || detailsUser._id || detailsUser.email] || "Active"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDetailsUser(null)}
                className="text-xs cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Member</h3>
                  <p className="text-xs text-muted-foreground">Update member profile and role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:ring-1"
                >
                  <option value="owner" className="bg-card text-foreground">
                    Owner
                  </option>
                  <option value="chief" className="bg-card text-foreground">
                    Chief
                  </option>
                  <option value="employee" className="bg-card text-foreground">
                    Employee
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditUser(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs cursor-pointer">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRMATION MODAL */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Remove Member</h3>
                <p className="text-xs text-muted-foreground">Are you sure you want to remove this member?</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              This will remove <strong>{deleteUser.name}</strong> ({deleteUser.email}) from the organization workspace.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteUser(null)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="text-xs cursor-pointer"
              >
                Delete Member
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MemberTable;
