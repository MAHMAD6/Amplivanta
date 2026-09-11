/**
 * Button class strings for the public site.
 *
 * Kept out of site-shell.tsx on purpose: that module is "use client", and a
 * server component importing a constant from a client module receives a
 * client reference instead of the string — the button then renders unstyled.
 */

export const btn =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border border-[#D7DDF0] bg-white px-6 py-[15px] text-[16px] font-bold text-site-ink transition hover:bg-site-soft";
export const btnPrimary =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] border-0 bg-gradient-to-r from-site-blue to-site-purple-2 px-6 py-[15px] text-[16px] font-bold text-white shadow-[0_10px_30px_rgba(86,55,242,0.18)] transition hover:opacity-95";
export const btnSmall = "px-4 py-[11px] text-[13px]";
export const btnDisabled =
  "pointer-events-none border-[#E1E6F0] bg-[#F3F5F9] text-[#7B879D] shadow-none";
