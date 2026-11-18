export type UserRole = "owner" | "chief" | "employee" | "employees";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: UserRole | string;
  organisations?: Array<{
    organisationId: string;
    organisationName: string;
  }>;
  createdAt?: string | Date;
}

export interface SignupPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole | string;
  organisationId?: string;
  organisationName?: string;
  organizationId?: string;
  organizationName?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface SigninResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

