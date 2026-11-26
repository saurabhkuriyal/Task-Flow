import mongoose from "mongoose";
import { TaskModel, type ITask } from "@/models/tasks.model";

export interface RecurringTaskCloneOptions {
  preserveDueDateInterval?: boolean;
}

/**
 * Creates an exact copy of a recurring task with status reset to 'todo'.
 * Copies identical:
 * - taskname
 * - orgId
 * - streamId
 * - userId (creator/assigner)
 * - assignedId (exact same member/assignee ID)
 * - priority
 * - impact
 * - description
 * - note
 * - recurring: true
 * Initializes:
 * - status: 'todo'
 * - date: new Date()
 * - dueDate: next interval or null
 * - parentTask: originalTask._id
 * - subtaskId: []
 * - timeLogs: []
 * - totalTimeSpent: 0
 */
export async function autoCreateRecurringTask(
  originalTask: ITask,
  options: RecurringTaskCloneOptions = { preserveDueDateInterval: true }
): Promise<ITask> {
  let nextDueDate: Date | null = null;

  if (originalTask.dueDate && options.preserveDueDateInterval) {
    const prevDue = new Date(originalTask.dueDate).getTime();
    const prevCreated = new Date(
      originalTask.createdAt || originalTask.date || Date.now()
    ).getTime();
    // Maintain the same cadence interval (minimum 1 day)
    const interval = Math.max(prevDue - prevCreated, 24 * 60 * 60 * 1000);
    nextDueDate = new Date(Date.now() + interval);
  }

  const streamObjectId =
    originalTask.streamId &&
    mongoose.Types.ObjectId.isValid(String(originalTask.streamId))
      ? new mongoose.Types.ObjectId(String(originalTask.streamId))
      : null;

  const assignedObjectId =
    originalTask.assignedId &&
    mongoose.Types.ObjectId.isValid(String(originalTask.assignedId))
      ? new mongoose.Types.ObjectId(String(originalTask.assignedId))
      : null;

  const newTask = await TaskModel.create({
    taskname: originalTask.taskname,
    orgId: new mongoose.Types.ObjectId(String(originalTask.orgId)),
    streamId: streamObjectId,
    userId: new mongoose.Types.ObjectId(String(originalTask.userId)),
    assignedId: assignedObjectId,
    status: "todo",
    priority: originalTask.priority || "medium",
    impact: originalTask.impact || "medium",
    description: originalTask.description || "",
    note: originalTask.note || "",
    recurring: true,
    date: new Date(),
    dueDate: nextDueDate,
    parentTask: originalTask._id,
    subtaskId: [],
    timeLogs: [],
    totalTimeSpent: 0,
  });

  return newTask;
}
