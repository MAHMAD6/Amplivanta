import { redirect } from "next/navigation";

// The in-app Help Center is Help & Support; one place keeps support options consistent.
export default function ResourcesHelpCenterPage() {
  redirect("/app/help");
}
