import axios, { AxiosError } from "axios";

export interface CreateStreamPayload {
  name: string;
  description: string;
  organisationId: string;
  organisationName: string;
  creatorId: string;
  creatorName: string;
  leadId?: string;
  leadName?: string;
  type?: "department" | "project" | "empTracker";
}

// Backward-compatibility alias
export type CreateDepartmentPayload = CreateStreamPayload;

export interface StreamResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

class StreamService {
  /**
   * Creates a new stream (department, project, or employee tracker)
   */
  async createStream(payload: CreateStreamPayload): Promise<StreamResponse> {
    try {
      console.log("stream payload", payload);

      const endpoint =
        payload.type === "department"
          ? "/api/streams/department"
          : "/api/streams";

      const response = await axios.post<StreamResponse>(
        endpoint,
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
          serverMessage || error.message || "Failed to create stream."
        );
      }
      throw new Error("An unexpected error occurred while creating stream.");
    }
  }

  /**
   * Creates a new department stream with organization, creator, and lead details
   */
  async createDepartment(
    payload: CreateStreamPayload
  ): Promise<StreamResponse> {
    return this.createStream({ ...payload, type: "department" });
  }

  /**
   * Creates a new project stream with organization and creator details
   */
  async createProject(
    payload: CreateStreamPayload
  ): Promise<StreamResponse> {
    return this.createStream({ ...payload, type: "project" });
  }

  /**
   * Creates a new employee tracker stream with member as lead
   */
  async createEmployeeTracker(
    payload: CreateStreamPayload
  ): Promise<StreamResponse> {
    return this.createStream({ ...payload, type: "empTracker" });
  }
}

export const streamService = new StreamService();
export default streamService;
