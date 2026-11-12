import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
  OrganizationDocumentData,
} from "@/types/organization";

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
}

export const organizationService = new OrganizationService();
export default organizationService;
