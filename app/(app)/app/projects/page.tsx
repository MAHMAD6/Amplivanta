import { redirect } from "next/navigation";

// "My Projects" lives inside Creative Studio; keep the shortcut working.
export default function ProjectsRedirect() {
  redirect("/app/creative-studio/projects");
}
