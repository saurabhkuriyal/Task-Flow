import { StreamDetailView } from "@/components/organization-workspace/stream";

export const metadata = {
  title: "Stream Detail | TaskFlow",
  description: "View and manage stream tasks, members, and sub-streams.",
};

export default function StreamDetailPage() {
  return <StreamDetailView />;
}
