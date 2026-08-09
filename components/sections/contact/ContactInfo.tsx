import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { CONTACT_INFO } from "@/lib/constants";

const items = [
  { icon: Mail, label: "Email", value: CONTACT_INFO.email },
  { icon: Phone, label: "Phone", value: CONTACT_INFO.phone },
  { icon: MapPin, label: "Address", value: CONTACT_INFO.address },
  { icon: Clock, label: "Hours", value: CONTACT_INFO.hours },
];

export function ContactInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E3E3E3] bg-white p-8">
        <h3 className="font-display text-xl font-bold text-[#0A0A0A]">Get in touch</h3>
        <ul className="mt-6 space-y-5">
          {items.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B5FF2D]">
                <Icon className="h-5 w-5 text-black" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">{label}</p>
                <p className="mt-0.5 text-sm text-[#0A0A0A]">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A3C2B] to-[#0F2A1D]">
        <MapPin className="h-12 w-12 text-[#B5FF2D]/40" />
      </div>
    </div>
  );
}
