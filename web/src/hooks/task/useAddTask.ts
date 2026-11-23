"use client";

import * as React from "react";
import { useUser } from "@/context/UserContext";
import { streamService, type StreamItem } from "@/services/stream.service";
import { taskService, type CreateTaskPayload } from "@/services/task.service";
import type { TaskPriority, TaskImpact, TaskStatus } from "@/models/tasks.model";

export interface StreamMemberOption {
  memberId: string;
  name: string;
  email?: string;
  role?: string;
}

export interface UseAddTaskOptions {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  stream?: StreamItem | null;
  streamId?: string;
  organisationId?: string;
}

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

export function useAddTask({
  isOpen = false,
  onClose,
  onSuccess,
  stream,
  streamId,
  organisationId,
}: UseAddTaskOptions) {
  const { userId, organizationId: contextOrgId, userName } = useUser();

  // 1. Autofilled parameters: orgId, streamId, and assignerId (userId)
  const targetOrgId = organisationId || contextOrgId || "";
  const targetStreamId = streamId || (stream?._id ? String(stream._id) : "") || (stream?.id ? String(stream.id) : "");
  const assignerId = userId || "";
  const assignerName = userName || "Current User";

  const isEmpTracker = stream?.type === "empTracker";

  // Tracked employee details if stream is an Employee Tracker
  const trackedEmployeeId = React.useMemo(() => {
    if (!isEmpTracker || !stream) return "";
    const leadId = stream.lead?.[0]?.id ? extractId(stream.lead[0].id) : "";
    if (leadId) return leadId;
    const memberId = stream.members?.[0]?.memberId ? extractId(stream.members[0].memberId) : "";
    return memberId;
  }, [isEmpTracker, stream]);

  const trackedEmployeeName = React.useMemo(() => {
    if (!isEmpTracker || !stream) return "";
    return stream.lead?.[0]?.name || stream.name || "Tracked Employee";
  }, [isEmpTracker, stream]);

  // 2. Form state
  const [taskname, setTaskname] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [impact, setImpact] = React.useState<TaskImpact>("medium");
  const [recurring, setRecurring] = React.useState(false);
  const [dueDate, setDueDate] = React.useState("");
  const [note, setNote] = React.useState("");
  const [assignedId, setAssignedId] = React.useState("");

  // Effective assigned ID automatically resolves to the tracked employee for empTracker streams
  const effectiveAssignedId = isEmpTracker ? trackedEmployeeId : assignedId;

  // 3. Status and feedback state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // 4. Stream members for assignment (restricted to this specific stream only)
  const [apiMembers, setApiMembers] = React.useState<StreamMemberOption[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(false);

  // Combine stream members from stream prop and getStreamMembers API response
  const streamMembers = React.useMemo(() => {
    const list: StreamMemberOption[] = [];
    const seen = new Set<string>();

    // 1. From live API call
    if (apiMembers.length > 0) {
      apiMembers.forEach((m) => {
        if (m.memberId && !seen.has(m.memberId)) {
          seen.add(m.memberId);
          list.push(m);
        }
      });
    }

    // 2. From stream prop members
    if (Array.isArray(stream?.members)) {
      stream.members.forEach((m) => {
        const id = extractId(m.memberId);
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push({
            memberId: id,
            name: m.memberName || "Stream Member",
            role: "member",
          });
        }
      });
    }

    // 3. From stream prop lead
    if (Array.isArray(stream?.lead)) {
      stream.lead.forEach((l) => {
        const id = extractId(l.id);
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push({
            memberId: id,
            name: l.name || "Lead",
            role: "lead",
          });
        }
      });
    }

    // 4. From stream prop manager
    if (Array.isArray(stream?.manager)) {
      stream.manager.forEach((m) => {
        const id = extractId(m.id);
        if (id && !seen.has(id)) {
          seen.add(id);
          list.push({
            memberId: id,
            name: m.name || "Manager",
            role: "manager",
          });
        }
      });
    }

    return list;
  }, [apiMembers, stream]);

  // Fetch members of this specific stream when modal opens (for departments/projects)
  React.useEffect(() => {
    if (!isOpen || !targetStreamId || isEmpTracker) {
      return;
    }

    let isCancelled = false;

    async function fetchMembers() {
      setIsLoadingMembers(true);
      try {
        const res = await streamService.getStreamMembers(targetStreamId, targetOrgId);
        if (!isCancelled && res.success) {
          const list: StreamMemberOption[] = [];
          if (Array.isArray(res.members)) {
            res.members.forEach((m) => {
              list.push({
                memberId: m.memberId,
                name: m.name || "Member",
                email: m.email || "",
                role: m.role || "member",
              });
            });
          }
          if (Array.isArray(res.lead)) {
            res.lead.forEach((l) => {
              list.push({
                memberId: l.id,
                name: l.name || "Lead",
                email: l.email || "",
                role: "lead",
              });
            });
          }
          if (Array.isArray(res.manager)) {
            res.manager.forEach((m) => {
              list.push({
                memberId: m.id,
                name: m.name || "Manager",
                email: m.email || "",
                role: "manager",
              });
            });
          }
          setApiMembers(list);
          setIsLoadingMembers(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Failed to fetch stream members for task assignment:", err);
          setIsLoadingMembers(false);
        }
      }
    }

    fetchMembers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, targetStreamId, targetOrgId, isEmpTracker]);

  // Reset form helper
  const resetForm = React.useCallback(() => {
    setTaskname("");
    setDescription("");
    setPriority("medium");
    setImpact("medium");
    setRecurring(false);
    setDueDate("");
    setNote("");
    setAssignedId("");
    setError(null);
    setIsSuccess(false);
    setSuccessMessage("");
  }, []);

  // 5. Submit handler
  const handleSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!taskname.trim()) {
        setError("Task name is required.");
        return;
      }

      if (!targetStreamId) {
        setError("Stream reference is missing.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const payload: CreateTaskPayload = {
          taskname: taskname.trim(),
          description: description.trim(),
          priority,
          impact,
          recurring,
          dueDate: dueDate || null,
          note: note.trim(),
          orgId: targetOrgId,
          streamId: targetStreamId,
          userId: assignerId,
          assignedId: effectiveAssignedId || null,
          status: "todo" as TaskStatus,
        };

        const res = await taskService.createTask(payload);

        if (res.success) {
          setSuccessMessage(res.message || "Task created successfully!");
          setIsSuccess(true);
          setIsSubmitting(false);

          setTimeout(() => {
            resetForm();
            onSuccess?.();
            onClose?.();
          }, 1000);
        } else {
          setError(res.message || "Failed to create task.");
          setIsSubmitting(false);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create task."
        );
        setIsSubmitting(false);
      }
    },
    [
      taskname,
      description,
      priority,
      impact,
      recurring,
      dueDate,
      note,
      targetOrgId,
      targetStreamId,
      assignerId,
      effectiveAssignedId,
      resetForm,
      onSuccess,
      onClose,
    ]
  );

  return {
    // Autofilled fields
    targetOrgId,
    targetStreamId,
    assignerId,
    assignerName,
    isEmpTracker,
    trackedEmployeeId,
    trackedEmployeeName,

    // Form states & setters
    taskname,
    setTaskname,
    description,
    setDescription,
    priority,
    setPriority,
    impact,
    setImpact,
    recurring,
    setRecurring,
    dueDate,
    setDueDate,
    note,
    setNote,
    assignedId: effectiveAssignedId,
    setAssignedId,

    // Stream members for selection
    streamMembers,
    isLoadingMembers,

    // Subtask availability (always inactive per user requirements)
    canCreateSubtask: false,

    // Status & handlers
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSubmit,
    resetForm,
  };
}

export default useAddTask;
