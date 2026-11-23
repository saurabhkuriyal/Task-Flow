import axios, { AxiosError } from "axios";

export interface CreateStreamPayload {
  name: string;
  description: string;
  organisationId: string;
  creatorId: string;
  organisationName?: string;
  creatorName?: string;
  leadId?: string;
  leadName?: string;
  type?: "department" | "project" | "empTracker";
  subStreamId?: string;
  subStreamName?: string;
  parentStreamId?: string;
  parentStreamName?: string;
}

// Backward-compatibility alias
export type CreateDepartmentPayload = CreateStreamPayload;

export interface StreamResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export interface StreamMemberItem {
  memberId: string;
  memberName: string;
  assigneeId?: string;
  assigneeName?: string;
}

export interface StreamLeadItem {
  id: string;
  name: string;
}

export interface StreamCreatorItem {
  userId: string;
  name: string;
}

export interface StreamManagerItem {
  id: string;
  name: string;
}

export interface StreamMemberDetail {
  memberId: string;
  name: string;
  email: string;
  role?: string;
  assigneeId?: string;
  assigneeName?: string;
}

export interface GetStreamMembersResponse {
  success: boolean;
  message?: string;
  count?: number;
  members: StreamMemberDetail[];
  lead?: StreamLeadItem[];
  manager?: StreamManagerItem[];
}

export interface StreamItem {
  _id: string;
  id?: string;
  name: string;
  type: "department" | "project" | "empTracker";
  description?: string;
  organisationId?: string;
  organisationName?: string;
  creator?: StreamCreatorItem[];
  lead?: StreamLeadItem[];
  manager?: StreamManagerItem[];
  members?: StreamMemberItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GetStreamsResponse {
  success: boolean;
  message?: string;
  count?: number;
  streams: StreamItem[];
  stream?: StreamItem;
}

export interface UpdateStreamPayload {
  streamId: string;
  name?: string;
  description?: string;
  leadId?: string;
  lead?: { id: string; name?: string };
  managerId?: string;
  manager?: { id: string; name?: string };
  memberId?: string;
  member?: { memberId: string; memberName?: string; assigneeId?: string };
  removeMemberId?: string;
  subStreamId?: string;
  parentStreamId?: string;
}

class StreamService {
  /**
   * Creates a new stream (department, project, or employee tracker)
   */
  async createStream(payload: CreateStreamPayload): Promise<StreamResponse> {
    try {
      console.log("stream payload", payload);

      const endpoint = "/api/stream/createStream";

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

  /**
   * Fetches streams for an organization with optional type filtering
   */
  async getStreams(
    organisationId?: string,
    type?: "department" | "project" | "empTracker"
  ): Promise<GetStreamsResponse> {
    try {
      const response = await axios.get<GetStreamsResponse>(
        "/api/stream/getStream",
        {
          params: { orgId: organisationId, type },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch streams."
        );
      }
      throw new Error("An unexpected error occurred while fetching streams.");
    }
  }

  /**
   * Fetches a single stream by id
   */
  async getStreamById(id: string): Promise<GetStreamsResponse> {
    try {
      const response = await axios.get<GetStreamsResponse>(
        "/api/stream/getStreamById",
        {
          params: { id },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch stream."
        );
      }
      throw new Error("An unexpected error occurred while fetching stream.");
    }
  }

  /**
   * Fetches all members of a stream by streamId and orgId
   */
  async getStreamMembers(
    streamId: string,
    organisationId?: string
  ): Promise<GetStreamMembersResponse> {
    try {
      const response = await axios.get<GetStreamMembersResponse>(
        "/api/stream/getStreamMembers",
        {
          params: { streamId, orgId: organisationId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to fetch stream members."
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching stream members."
      );
    }
  }

  /**
   * Fetches employee tracker streams for a specific parent stream
   */
  async getSpecificEmployeeStreams(
    streamId: string,
    organisationId?: string
  ): Promise<GetStreamsResponse> {
    try {
      const response = await axios.get<GetStreamsResponse>(
        "/api/stream/getSpecificEmployeeStreams",
        {
          params: { streamId, orgId: organisationId },
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage ||
            error.message ||
            "Failed to fetch employee tracker streams."
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching employee tracker streams."
      );
    }
  }

  /**
   * Updates stream lead, manager, or member
   */
  async updateStream(payload: UpdateStreamPayload): Promise<StreamResponse> {
    try {
      const response = await axios.post<StreamResponse>(
        "/api/stream/updateStream",
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
          serverMessage || error.message || "Failed to update stream."
        );
      }
      throw new Error("An unexpected error occurred while updating stream.");
    }
  }
}

export const streamService = new StreamService();
export default streamService;
