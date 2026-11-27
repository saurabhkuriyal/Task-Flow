import { SpecificStreamView } from "@/components/organization-workspace/specificStream";

export const metadata = {
  title: "Employee Stream Detail | TaskFlow",
  description:
    "View and manage stream tasks, team members, and assignments outside the organization workspace layout.",
};

interface EmployeeEmpStreamDetailPageProps {
  params: Promise<{ id: string; streamId: string }>;
  searchParams: Promise<{ orgId?: string }>;
}

export default async function EmployeeEmpStreamDetailPage({
  params,
  searchParams,
}: EmployeeEmpStreamDetailPageProps) {
  const { id: empId, streamId } = await params;
  const { orgId } = await searchParams;

  const backHref = orgId
    ? `/employee/${empId}/empanel?orgId=${orgId}`
    : `/employee/${empId}/empanel`;

  return (
    <SpecificStreamView
      streamId={streamId}
      organisationId={orgId}
      backHref={backHref}
      backLabel="Managed Streams"
    />
  );
}
