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
  WORKSPACES: "/api/workspaces",
} as const;
