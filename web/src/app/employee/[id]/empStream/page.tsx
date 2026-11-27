import { SpecificStreamView } from "@/components/organization-workspace/specificStream";
import { EmployeeManagedStreamsPanel } from "@/components/employee";

export const metadata = {
  title: "Employee Stream | TaskFlow",
  description: "View and manage stream details for this employee.",
};

interface EmployeeEmpStreamPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ streamId?: string; orgId?: string }>;
}

export default async function EmployeeEmpStreamPage({
  params,
  searchParams,
}: EmployeeEmpStreamPageProps) {
  const { id: empId } = await params;
  const { streamId, orgId } = await searchParams;

  if (!streamId) {
    return <EmployeeManagedStreamsPanel empId={empId} orgId={orgId} />;
  }

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
