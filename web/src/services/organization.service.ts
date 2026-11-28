import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  OrganizationDocumentData,
} from "@/types/organization";

export interface OrganizationAnalyticsData {
  organization: {
    id: string;
    organizationName: string;
    gstNo?: string;
    establishedYear?: number;
    teamSize?: number;
    mrr?: number;
    arr?: number;
  };
  streams: {
    total: number;
    departmentsCount: number;
    projectsCount: number;
    empTrackersCount: number;
  };
  team: {
    totalMembers: number;
    employeesCount: number;
    managersCount: number;
    leadsCount: number;
    adminsCount: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    directTasks: number;
    streamTasks: number;
    completionRate: number;
    totalTimeSpent: number;
    byStatus: {
      todo: number;
      in_progress: number;
      in_review: number;
      completed: number;
      blocked: number;
      backlog: number;
    };
    byPriority: {
      urgent: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  streamWorkload: Array<{
    streamId: string;
    name: string;
    type: "department" | "project" | "empTracker";
    total: number;
    completed: number;
    pending: number;
  }>;
  weeklyTrend: Array<{
    date: string;
    label: string;
    created: number;
    completed: number;
  }>;
}

export interface OrganizationAnalyticsResponse {
  success: boolean;
  message?: string;
  analytics?: OrganizationAnalyticsData;
}

export interface GetOrganizationByIdResponse {
  success: boolean;
  message?: string;
  organization?: OrganizationDocumentData;
}

class OrganizationService {
  /**
   * Creates a new organization with company details, GST, and revenue metrics
   */
  async createOrganization(
    payload: CreateOrganizationPayload
  ): Promise<CreateOrganizationResponse> {
    try {
      const response = await axios.post<CreateOrganizationResponse>(
        API_ENDPOINTS.ORGANIZATIONS.CREATE,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage || error.message || "Failed to create organization."
        );
      }

      throw new Error("An unexpected error occurred while creating the organization.");
    }
  }

  /**
   * Fetches organizations associated with a specific user ID
   */
  async getOrganizationsByUserId(userId: string): Promise<OrganizationDocumentData[]> {
    try {
      if (!userId || userId === "undefined") {
        return [];
      }

      const response = await axios.get<{
        success: boolean;
        organizations: OrganizationDocumentData[];
      } | OrganizationDocumentData[]>(
        `${API_ENDPOINTS.ORGANIZATIONS.GET_ORGANIZATION}/${userId}`,
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data)) {
        return response.data;
      }

      return response.data.organizations || [];
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Fetch organizations by user error:", error.response?.data?.message || error.message);
      }
      return [];
    }
  }

  /**
   * Fetches a single organization document by its ID or name
   */
  async getOrganizationById(
    orgId: string
  ): Promise<OrganizationDocumentData | null> {
    try {
      if (!orgId || orgId === "undefined") {
        return null;
      }

      const response = await axios.get<GetOrganizationByIdResponse>(
        `${API_ENDPOINTS.ORGANIZATIONS.BASE}/${encodeURIComponent(orgId)}`,
        {
          withCredentials: true,
        }
      );

      if (response.data?.success && response.data.organization) {
        return response.data.organization;
      }

      return null;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Fetch organization by ID error:",
          error.response?.data?.message || error.message
        );
      }
      return null;
    }
  }

  /**
   * Fetches aggregated analytics (streams, team, tasks, workload, 7-day trend) for an organization
   */
  async getOrganizationAnalytics(
    orgId: string
  ): Promise<OrganizationAnalyticsResponse> {
    try {
      const response = await axios.get<OrganizationAnalyticsResponse>(
        `${API_ENDPOINTS.ORGANIZATIONS.BASE}/${encodeURIComponent(orgId)}/analytics`,
        {
          withCredentials: true,
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(
          serverMessage ||
            error.message ||
            "Failed to fetch organization analytics."
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching organization analytics."
      );
    }
  }
}

export const organizationService = new OrganizationService();
export default organizationService;
