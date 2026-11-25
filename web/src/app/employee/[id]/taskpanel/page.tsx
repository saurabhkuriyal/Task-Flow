import { EmployeeTaskPanel } from "@/components/employee";

export const metadata = {
  title: "Employee Task Panel | TaskFlow",
  description: "View all tasks assigned to this team member categorized by streams and assigners.",
};

interface EmployeeTaskPanelPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orgId?: string }>;
}

export default async function EmployeeTaskPanelPage({
  params,
  searchParams,
}: EmployeeTaskPanelPageProps) {
  const { id } = await params;
  const { orgId } = await searchParams;

  return <EmployeeTaskPanel userId={id} orgId={orgId} />;
}
