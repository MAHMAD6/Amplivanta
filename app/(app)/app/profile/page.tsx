import Link from "next/link";
import { Settings, Bell, FileText, Headphones, Star, LogOut, ChevronRight, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { USER } from "@/lib/app-data";

const ROWS = [
  { icon: SlidersHorizontal, label: "Account Settings", href: "/app/profile" },
  { icon: Bell, label: "Notifications", href: "/app/notifications" },
  { icon: FileText, label: "Terms & Policies", href: "/app/profile" },
  { icon: Headphones, label: "Support / Help Center", href: "/app/profile" },
  { icon: Star, label: "Rate Us", href: "/app/profile" },
  { icon: LogOut, label: "Logout", href: "/app/login" },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col pb-6">
      <AppHeader title="Profile" back={null} right={<Settings className="h-5 w-5 text-[#14121f]" />} />

      {/* identity */}
      <div className="flex flex-col items-center px-5 pt-2 text-center">
        <span className="bg-grad-brand-2 flex h-20 w-20 items-center justify-center rounded-full font-display text-2xl font-extrabold text-white shadow-lg">
          {USER.name.charAt(0)}
        </span>
        <p className="mt-3 font-display text-lg font-extrabold text-[#14121f]">{USER.name}</p>
        <p className="text-sm text-[#767287]">{USER.email}</p>
        <p className="text-sm text-[#767287]">{USER.country}</p>
        <button className="bg-grad-cta mt-4 rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(109,59,245,0.5)]">
          Edit Profile
        </button>
      </div>

      {/* menu */}
      <div className="mt-6 space-y-2.5 px-5">
        {ROWS.map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-[#e9e7f0] bg-white px-4 py-3.5 shadow-[0_8px_20px_-16px_rgba(30,20,60,0.3)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f8f7fb]">
              <Icon className="h-4 w-4 text-[#6D3BF5]" />
            </span>
            <span className="flex-1 text-sm font-semibold text-[#14121f]">{label}</span>
            <ChevronRight className="h-4 w-4 text-[#a8a4b8]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
