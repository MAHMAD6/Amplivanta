import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MessageDetail } from "@/components/admin/MessageDetail";
import type { ContactMessage } from "@/types";

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const message = await db.contact.findUnique({ where: { id } }).catch(() => null);
  if (!message) notFound();
  return <MessageDetail message={message as ContactMessage} />;
}
