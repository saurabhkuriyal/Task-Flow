export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
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
  organizationId: string;
  token?: string;
  user?: User;
}

export interface AuthErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

