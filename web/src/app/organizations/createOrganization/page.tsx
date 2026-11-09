import { CreateOrganizationForm } from "@/components/organizations";

export const metadata = {
  title: "Create Organization | TaskFlow",
  description: "Register a new enterprise organization with GST and revenue metrics.",
};

export default function CreateOrganizationPage() {
  return <CreateOrganizationForm />;
}

