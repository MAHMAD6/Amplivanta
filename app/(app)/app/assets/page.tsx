import { redirect } from "next/navigation";

// "My Assets" is the workspace asset library.
export default function AssetsRedirect() {
  redirect("/app/workspace/assets");
}
