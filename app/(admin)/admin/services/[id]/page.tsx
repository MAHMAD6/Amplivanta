import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ServiceForm } from "@/components/admin/ServiceForm";
import type { Service } from "@/types";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await db.service.findUnique({ where: { id } }).catch(() => null);
  if (!service) notFound();
  return <ServiceForm initial={service as Service} />;
}
