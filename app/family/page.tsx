import { requireUser } from "@/lib/auth";
import FamilyClient from "./FamilyClient";

export default async function FamilyPage() {
  await requireUser();

  return <FamilyClient />;
}
