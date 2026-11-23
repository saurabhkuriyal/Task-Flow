import axios, { AxiosError } from "axios";
import type { TaskStatus, TaskPriority, TaskImpact } from "@/models/tasks.model";

/**
 * Payload interface for creating a new task.
 * OrgId, streamId, and userId (assignerId) are autofilled by the hook.
 */
export interface CreateTaskPayload {
  taskname: string;
  orgId: string;
  streamId: string;
  userId: string; // Assigner ID (current user)
  status?: TaskStatus;
  priority?: TaskPriority;
  impact?: TaskImpact;
  recurring?: boolean;
  date?: string;
  assignedId?: string | null;
  description?: string;
  note?: string;
  dueDate?: string | null;
  parentTask?: string | null;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface TaskItem {
  id: string;
  _id?: string;
  taskname: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  impact?: TaskImpact;
  recurring?: boolean;
  dueDate?: string | null;
  date?: string;
  assignedId?: string | null;
  assigneeName?: string;
  userId?: string;
  assignerName?: string;
  subtaskId?: string[];
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTasksResponse {
  success: boolean;
  message?: string;
  count: number;
  tasks: TaskItem[];
}

/**
 * Service to manage Task API communications.
 * Keeps API requests modular, typed, and uncluttered.
 */
class TaskService {
  /**
   * Dispatches task creation payload to the API.
   */
  async createTask(payload: CreateTaskPayload): Promise<TaskResponse> {
    try {
      const response = await axios.post<TaskResponse>(
        "/api/tasks/createTask",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to create task."
        );
      }
      throw new Error("An unexpected error occurred while creating task.");
    }
  }

  /**
   * Fetches all tasks associated with a specific stream ID.
   */
  async getTasksByStream(
    streamId: string,
    orgId?: string
  ): Promise<GetTasksResponse> {
    try {
      const response = await axios.get<GetTasksResponse>(
        "/api/tasks/getTasksByStream",
        {
          params: { streamId, orgId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch stream tasks."
        );
      }
      throw new Error("An unexpected error occurred while fetching tasks.");
    }
  }
}

export const taskService = new TaskService();
export default taskService;
