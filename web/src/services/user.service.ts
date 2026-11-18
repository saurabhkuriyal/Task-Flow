import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { User } from "@/types/auth";

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  users: User[];
  user?: User;
  count?: number;
}

class UserService {
  /**
   * Fetches users associated with an organization ID (or all users if omitted)
   */
  async getUsers(orgId?: string): Promise<GetUsersResponse> {
    try {
      const url = orgId
        ? `${API_ENDPOINTS.USER.GET_USER}?orgId=${encodeURIComponent(orgId)}`
        : API_ENDPOINTS.USER.GET_USER;

      const response = await axios.get<GetUsersResponse>(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Failed to fetch users.");
      }

      throw new Error("An unexpected error occurred while fetching users.");
    }
  }

  /**
   * Fetches a specific user by userId
   */
  async getUser(userId: string): Promise<GetUsersResponse> {
    try {
      const url = `${API_ENDPOINTS.USER.GET_USER}?userId=${encodeURIComponent(userId)}`;

      const response = await axios.get<GetUsersResponse>(url, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Failed to fetch user.");
      }

      throw new Error("An unexpected error occurred while fetching user.");
    }
  }
}

export const userService = new UserService();
export default userService;
