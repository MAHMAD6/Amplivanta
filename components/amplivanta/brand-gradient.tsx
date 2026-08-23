import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
  variant = "diagonal",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "diagonal" | "horizontal";
}) {
  return (
    <span
      className={cn(
        "inline-block bg-clip-text pb-[0.08em] text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]",
        variant === "diagonal" ? "bg-grad-brand-2" : "bg-grad-brand",
        className
      )}
    >
      {children}
    </span>
  );
}

export function GradientButton({
  children,
  href,
  onClick,
  className,
  size = "md",
  as: Tag = "a",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  as?: React.ElementType;
}) {
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-grad-cta font-semibold text-white shadow-violet transition hover:brightness-105 active:brightness-95",
        sizes[size],
        className
      )}
    >
      {children}
    </Tag>
  );
}
