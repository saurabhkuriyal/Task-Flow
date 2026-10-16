import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type { SignupPayload, SignupResponse } from "@/types/auth";

class AuthService {
  /**
   * Registers a new user with the provided credentials
   */
  async signup(payload: SignupPayload): Promise<SignupResponse> {
    try {
      const response = await axios.post<SignupResponse>(
        API_ENDPOINTS.AUTH.SIGNUP,
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
        throw new Error(serverMessage || error.message || "Signup failed. Please try again.");
      }
      throw new Error("An unexpected error occurred during signup.");
    }
  }
}

export const authService = new AuthService();
export default authService;
