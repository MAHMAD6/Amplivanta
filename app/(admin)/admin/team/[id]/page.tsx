import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TeamForm } from "@/components/admin/TeamForm";
import type { TeamMember } from "@/types";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await db.teamMember.findUnique({ where: { id } }).catch(() => null);
  if (!member) notFound();
  return <TeamForm initial={member as TeamMember} />;
}
