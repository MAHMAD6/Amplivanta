"use server";

import { signOut } from "@/lib/auth";

/** Ends the session from the app shell's Log out control. */
export async function logOut() {
  await signOut({ redirectTo: "/login" });
}
