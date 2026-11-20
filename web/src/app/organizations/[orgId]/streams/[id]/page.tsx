import { SpecificStreamView } from "@/components/organization-workspace/specificStream";

export const metadata = {
  title: "Stream Detail | TaskFlow",
  description: "View and manage stream tasks, members, and sub-streams.",
};

export default function StreamDetailPage() {
  return <SpecificStreamView />;
}
