import { redirect } from "next/navigation";

export default function MissionsPage() {
  // Redirect to default organization
  redirect("/en/missions/dev-org");
}
