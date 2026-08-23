import {
  BarChart3,
  BookOpen,
  Compass,
  FileText,
  LayoutTemplate,
  Lightbulb,
  Mail,
  MessageSquare,
  PenLine,
  Rocket,
  Settings,
  Share2,
  Ticket,
  Users,
  Workflow,
} from "lucide-react";

const map = {
  rocket: Rocket,
  workflow: Workflow,
  pen: PenLine,
  chart: BarChart3,
  settings: Settings,
  share: Share2,
  book: BookOpen,
  compass: Compass,
  mail: Mail,
  layout: LayoutTemplate,
  form: FileText,
  ticket: Ticket,
  chat: MessageSquare,
  users: Users,
  bulb: Lightbulb,
} as const;

export function ResourceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name as keyof typeof map] ?? BookOpen;
  return <Icon className={className} />;
}
