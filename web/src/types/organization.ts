export interface MemberItem {
  memberId: string;
  name: string;
}

export interface DepartmentItem {
  departmentId: string;
  departmentName: string;
  head?: string;
  project?: string;
}

export interface ProjectItem {
  projectId: string;
  name: string;
  lead?: string;
}

export interface EmployeeItem {
  empId: string;
  name: string;
}

export interface CreateOrganizationPayload {
  organizationName: string;
  gstNo: string;
  establishedYear: number;
  teamSize: number;
  mrr: number;
  arr: number;
  ownerId?: string;
}

export interface OrganizationDocumentData {
  _id?: string;
  id?: string;
  ownerId: string;
  organizationName: string;
  gstNo: string;
  establishedYear: number;
  teamSize: number;
  arr: number;
  mrr: number;
  members: MemberItem[];
  departments: DepartmentItem[];
  projects: ProjectItem[];
  employees: EmployeeItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  organization?: OrganizationDocumentData | Record<string, unknown>;
}

export interface OrganizationFormValues {
  companyName: string;
  gstNumber: string;
  yearOfEstablishment: number | string;
  noOfPeople: number | string;
  mrr: number | string;
  arr: number | string;
  isAgreed: boolean;
}
