import axios, { AxiosError } from "axios";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  SignupPayload,
  SignupResponse,
  SigninPayload,
  SigninResponse,
} from "@/types/auth";

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

      console.log("signup response", response);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Signup failed. Please try again.");
      }

      console.log("signup error", error);
      throw new Error("An unexpected error occurred during signup.");
    }
  }

  /**
   * Authenticates an existing user
   */
  async signin(payload: SigninPayload): Promise<SigninResponse> {
    try {
      const response = await axios.post<SigninResponse>(
        API_ENDPOINTS.AUTH.SIGNIN,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("signin response", response);
      return response.data;



    } catch (error) {
      if (error instanceof AxiosError) {
        const serverMessage = error.response?.data?.message;
        throw new Error(serverMessage || error.message || "Sign in failed. Please check your credentials.");
      }

      console.log("signin error", error);
      throw new Error("An unexpected error occurred during sign in.");
    }
  }
}

export const authService = new AuthService();
export default authService;
