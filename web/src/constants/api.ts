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
  TASKS: {
    GET_BY_ORG: "/api/tasks/getTasksByOrg",
    GET_BY_STREAM: "/api/tasks/getTasksByStream",
    GET_BY_USER: "/api/tasks/getTasksByUserId",
  },
  USER: {
    GET_USER: "/api/user/getUser",
  },
  WORKSPACES: "/api/workspaces",
} as const;
