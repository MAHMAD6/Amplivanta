import { redirect } from "next/navigation";

// "Campaign Center" is the Marketing Automation campaigns list.
export default function CampaignsRedirect() {
  redirect("/app/marketing/campaigns");
}
