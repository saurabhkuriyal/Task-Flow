import { redirect } from "next/navigation";

interface TypoPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orgId?: string }>;
}

export default async function TypoEmployeeTaskPanelPage({
  params,
  searchParams,
}: TypoPageProps) {
  const { id } = await params;
  const { orgId } = await searchParams;
  const destination = `/employee/${id}/taskpanel${orgId ? `?orgId=${orgId}` : ""}`;
  redirect(destination);
}
