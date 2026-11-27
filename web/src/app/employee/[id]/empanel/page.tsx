import { EmployeeManagedStreamsPanel } from "@/components/employee";

export const metadata = {
  title: "Employee Streams & Projects | TaskFlow",
  description:
    "View streams and projects where this employee is assigned as manager or lead.",
};

interface EmployeeEmpanelPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orgId?: string }>;
}

export default async function EmployeeEmpanelPage({
  params,
  searchParams,
}: EmployeeEmpanelPageProps) {
  const { id } = await params;
  const { orgId } = await searchParams;

  return <EmployeeManagedStreamsPanel empId={id} orgId={orgId} />;
}
