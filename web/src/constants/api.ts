export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: "/api/auth/signin",
    SIGNUP: "/api/auth/signup",
  },
  ORGANIZATIONS: {
    BASE: "/api/organizations",
    CREATE: "/api/organizations/createOrganization",
    GET_ORGANIZATION: "/api/organizations/getOrganization",
  },
  USER: {
    GET_USER: "/api/user/getUser",
  },
  WORKSPACES: "/api/workspaces",
} as const;
