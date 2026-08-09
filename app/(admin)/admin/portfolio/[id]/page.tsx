import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PortfolioForm } from "@/components/admin/PortfolioForm";
import type { Portfolio } from "@/types";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.portfolio.findUnique({ where: { id } }).catch(() => null);
  if (!item) notFound();
  return <PortfolioForm initial={item as unknown as Portfolio} />;
}
