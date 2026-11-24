import axios, { AxiosError } from "axios";
import type { ITimeLog } from "@/models/tasks.model";

export interface StartTimeLogPayload {
  taskId: string;
  userId: string;
  startTime?: string | Date;
}

export interface StopTimeLogPayload {
  taskId: string;
  userId?: string;
  timeLogId?: string;
  endTime?: string | Date;
  duration?: number; // duration in seconds
}

export interface TimeLogResponse {
  success: boolean;
  message: string;
  data?: {
    timeLog: ITimeLog;
    timeLogs: ITimeLog[];
    totalTimeSpent: number;
  };
}

export interface GetTimeLogsResponse {
  success: boolean;
  message?: string;
  timeLogs: ITimeLog[];
  totalTimeSpent: number; // in seconds
}

/**
 * Service to handle TimeLog API calls with backend persistence.
 */
class TimelogService {
  /**
   * Persists the start of a timer session in MongoDB.
   */
  async startTimeLog(payload: StartTimeLogPayload): Promise<TimeLogResponse> {
    try {
      const response = await axios.post<TimeLogResponse>(
        "/api/tasks/timelog",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Failed to start time log.");
      }
      throw new Error("An unexpected error occurred while starting time log.");
    }
  }

  /**
   * Persists the end of a timer session in MongoDB and updates cumulative time.
   */
  async stopTimeLog(payload: StopTimeLogPayload): Promise<TimeLogResponse> {
    try {
      const response = await axios.put<TimeLogResponse>(
        "/api/tasks/timelog",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Failed to stop time log.");
      }
      throw new Error("An unexpected error occurred while stopping time log.");
    }
  }

  /**
   * Retrieves all time logs and cumulative total duration for a task.
   */
  async getTimeLogs(taskId: string): Promise<GetTimeLogsResponse> {
    try {
      const response = await axios.get<GetTimeLogsResponse>(
        "/api/tasks/timelog",
        {
          params: { taskId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Failed to fetch time logs.");
      }
      throw new Error("An unexpected error occurred while fetching time logs.");
    }
  }
}

export const timelogService = new TimelogService();
export default timelogService;
