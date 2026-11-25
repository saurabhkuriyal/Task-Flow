import axios, { AxiosError } from "axios";
import type { TaskStatus, TaskPriority, TaskImpact, ITimeLog } from "@/models/tasks.model";

/**
 * Payload interface for creating a new task.
 * OrgId, streamId, and userId (assignerId) are autofilled by the hook.
 */
export interface CreateTaskPayload {
  taskname: string;
  orgId: string;
  streamId?: string | null;
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

export interface UpdateTaskPayload {
  taskId?: string;
  taskname?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  impact?: TaskImpact;
  recurring?: boolean;
  dueDate?: string | null;
  assignedId?: string | null;
  note?: string;
}

export interface StartTimerPayload {
  taskId: string;
  userId: string;
  startTime?: string | Date;
}

export interface StopTimerPayload {
  taskId: string;
  userId: string;
  endTime?: string | Date;
  duration?: number; // duration in seconds
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface TimeLogsResponse {
  success: boolean;
  message?: string;
  timeLogs: ITimeLog[];
  totalTimeSpent: number; // in seconds
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
  assignerEmail?: string;
  assignerRole?: string;
  streamId?: string;
  streamName?: string;
  streamType?: string;
  subtaskId?: string[];
  note?: string;
  timeLogs?: ITimeLog[];
  totalTimeSpent?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetTasksResponse {
  success: boolean;
  message?: string;
  count: number;
  tasks: TaskItem[];
}

export interface CategorizedStreamGroup {
  streamId: string;
  streamName: string;
  streamType: string;
  description?: string;
  tasks: TaskItem[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTimeSpent: number;
}

export interface CategorizedAssignerGroup {
  assignerId: string;
  assignerName: string;
  assignerEmail?: string;
  assignerRole?: string;
  tasks: TaskItem[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalTimeSpent: number;
}

export interface EmployeeInfo {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

export interface GetTasksByUserResponse {
  success: boolean;
  message?: string;
  count: number;
  employee?: EmployeeInfo | null;
  tasks: TaskItem[];
  categorizedByStream: CategorizedStreamGroup[];
  categorizedByAssigner: CategorizedAssignerGroup[];
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
   * Updates an existing task by ID.
   */
  async updateTask(
    taskId: string,
    payload: UpdateTaskPayload
  ): Promise<TaskResponse> {
    try {
      const response = await axios.put<TaskResponse>(
        "/api/tasks/updateTask",
        { taskId, ...payload },
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
          serverMessage || error.message || "Failed to update task."
        );
      }
      throw new Error("An unexpected error occurred while updating task.");
    }
  }

  /**
   * Deletes a task by ID.
   */
  async deleteTask(taskId: string): Promise<TaskResponse> {
    try {
      const response = await axios.delete<TaskResponse>(
        "/api/tasks/deleteTask",
        {
          data: { taskId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to delete task."
        );
      }
      throw new Error("An unexpected error occurred while deleting task.");
    }
  }

  /**
   * Starts a new live timer session on a task.
   */
  async startTimer(payload: StartTimerPayload): Promise<TaskResponse> {
    try {
      const response = await axios.post<TaskResponse>(
        "/api/tasks/timer/start",
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
          serverMessage || error.message || "Failed to start timer."
        );
      }
      throw new Error("An unexpected error occurred while starting timer.");
    }
  }

  /**
   * Stops an active timer session on a task and records duration.
   */
  async stopTimer(payload: StopTimerPayload): Promise<TaskResponse> {
    try {
      const response = await axios.post<TaskResponse>(
        "/api/tasks/timer/stop",
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
          serverMessage || error.message || "Failed to stop timer."
        );
      }
      throw new Error("An unexpected error occurred while stopping timer.");
    }
  }

  /**
   * Fetches all recorded timelogs and cumulative total for a task.
   */
  async getTimeLogs(taskId: string): Promise<TimeLogsResponse> {
    try {
      const response = await axios.get<TimeLogsResponse>(
        "/api/tasks/timer/logs",
        {
          params: { taskId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch time logs."
        );
      }
      throw new Error("An unexpected error occurred while fetching time logs.");
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

  /**
   * Fetches all tasks assigned to a specific user ID, categorized by streams and assigners.
   */
  async getTasksByUserId(
    userId: string,
    orgId?: string
  ): Promise<GetTasksByUserResponse> {
    try {
      const response = await axios.get<GetTasksByUserResponse>(
        "/api/tasks/getTasksByUserId",
        {
          params: { userId, orgId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch user tasks."
        );
      }
      throw new Error("An unexpected error occurred while fetching user tasks.");
    }
  }
}

export const taskService = new TaskService();
export default taskService;
