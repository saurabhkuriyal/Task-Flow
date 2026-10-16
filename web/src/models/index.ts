export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  role: string;
  membersCount: number;
  activeTasksCount: number;
  createdAt: string;
}
