export interface CreateOrganizationPayload {
  name: string;
  gstNumber: string;
  yearOfEstablishment: number;
  noOfPeople: number;
  mrr: number;
  arr: number;
  isAgreed: boolean;
  description?: string;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    gstNumber: string;
    yearOfEstablishment: number;
    noOfPeople: number;
    mrr: number;
    arr: number;
    role: string;
    createdAt: string;
  };
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

