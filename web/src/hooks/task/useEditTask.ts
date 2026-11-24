"use client";

import * as React from "react";
import { streamService, type StreamItem } from "@/services/stream.service";
import { taskService, type UpdateTaskPayload, type TaskItem } from "@/services/task.service";
import type { TaskPriority, TaskImpact, TaskStatus } from "@/models/tasks.model";
import type { StreamMemberOption } from "./useAddTask";

export interface UseEditTaskOptions {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: TaskItem | null;
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

export function useEditTask({
  isOpen,
  onClose,
  onSuccess,
  task,
  stream,
  streamId,
  organisationId,
}: UseEditTaskOptions) {
  const targetOrgId = organisationId || "";
  const targetStreamId = streamId || (stream?._id ? String(stream._id) : "") || (stream?.id ? String(stream.id) : "");
  const isEmpTracker = stream?.type === "empTracker";

  // Form State initialized directly from task prop (avoids setState in effect)
  const [taskname, setTaskname] = React.useState(task?.taskname || task?.title || "");
  const [description, setDescription] = React.useState(task?.description || "");
  const [priority, setPriority] = React.useState<TaskPriority>(task?.priority || "medium");
  const [impact, setImpact] = React.useState<TaskImpact>(task?.impact || "medium");
  const [status, setStatus] = React.useState<TaskStatus>(task?.status || "todo");
  const [recurring, setRecurring] = React.useState(Boolean(task?.recurring));
  const [dueDate, setDueDate] = React.useState(() => {
    if (!task?.dueDate) return "";
    try {
      const d = new Date(task.dueDate);
      return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : "";
    } catch {
      return "";
    }
  });
  const [note, setNote] = React.useState(task?.note || "");
  const [assignedId, setAssignedId] = React.useState(() =>
    task?.assignedId ? extractId(task.assignedId) : ""
  );

  // Status and feedback
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Members options
  const [apiMembers, setApiMembers] = React.useState<StreamMemberOption[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(false);

  // Combine stream members for assignment dropdown
  const streamMembers = React.useMemo(() => {
    const list: StreamMemberOption[] = [];
    const seen = new Set<string>();

    if (apiMembers.length > 0) {
      apiMembers.forEach((m) => {
        if (m.memberId && !seen.has(m.memberId)) {
          seen.add(m.memberId);
          list.push(m);
        }
      });
    }

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

  // Fetch members when modal is opened
  React.useEffect(() => {
    if (!isOpen || !targetStreamId || isEmpTracker) return;

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
          console.warn("Failed to fetch stream members for task edit:", err);
          setIsLoadingMembers(false);
        }
      }
    }

    fetchMembers();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, targetStreamId, targetOrgId, isEmpTracker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const taskId = task.id || task._id;
    if (!taskId) {
      setError("Task ID is missing.");
      return;
    }

    if (!taskname.trim()) {
      setError("Task name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setIsSuccess(false);

    const payload: UpdateTaskPayload = {
      taskname: taskname.trim(),
      description: description.trim(),
      priority,
      impact,
      status,
      recurring,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignedId: assignedId || null,
      note: note.trim(),
    };

    try {
      const response = await taskService.updateTask(taskId, payload);
      if (response.success) {
        setIsSuccess(true);
        setSuccessMessage(response.message || "Task updated successfully!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        setError(response.message || "Failed to update task.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update task.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    taskname,
    setTaskname,
    description,
    setDescription,
    priority,
    setPriority,
    impact,
    setImpact,
    status,
    setStatus,
    recurring,
    setRecurring,
    dueDate,
    setDueDate,
    note,
    setNote,
    assignedId,
    setAssignedId,
    streamMembers,
    isLoadingMembers,
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSubmit,
  };
}

export default useEditTask;
