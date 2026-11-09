import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  CreateOrganizationPayload,
  CreateOrganizationResponse,
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
        API_ENDPOINTS.ORGANIZATIONS,
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
}

export const organizationService = new OrganizationService();
export default organizationService;

