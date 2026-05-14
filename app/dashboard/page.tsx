import { requireUser } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  await requireUser();

  return <DashboardClient />;
}
