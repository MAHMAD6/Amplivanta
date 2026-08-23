import {
  Archive,
  Bookmark,
  CheckCircle2,
  DollarSign,
  Flame,
  Lightbulb,
  ListChecks,
  Mail,
  Share2,
  Target,
  TrendingUp,
  Trophy,
  Users,
  BarChart3,
  XCircle,
} from "lucide-react";

const map = {
  list: ListChecks,
  check: CheckCircle2,
  bookmark: Bookmark,
  x: XCircle,
  users: Users,
  mail: Mail,
  chart: BarChart3,
  bulb: Lightbulb,
  target: Target,
  trend: TrendingUp,
  dollar: DollarSign,
  flame: Flame,
  archive: Archive,
  share: Share2,
  trophy: Trophy,
} as const;

export function AdvisorIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name as keyof typeof map] ?? CheckCircle2;
  return <Icon className={className} />;
}
