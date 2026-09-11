import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * Sign-in providers. Google and Microsoft appear only when their credentials
 * are set (AUTH_GOOGLE_*, AUTH_MICROSOFT_ENTRA_ID_*), so nothing changes until
 * the accounts exist.
 *
 * An OAuth sign-in never creates an account on its own. It links to an
 * existing user by provider-verified email the first time, stores the
 * provider's immutable subject in UserIdentity, and from then on matches by
 * subject — so a later email change at the provider cannot hijack an account.
 */

export const oauthSignInProviders = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  "microsoft-entra-id": Boolean(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET),
};

const providers: Provider[] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await db.user.findUnique({
        where: { email: credentials.email as string },
      });
      if (!user) return null;
      const valid = await bcrypt.compare(credentials.password as string, user.password);
      if (!valid) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  }),
];
if (oauthSignInProviders.google) providers.push(Google);
if (oauthSignInProviders["microsoft-entra-id"]) providers.push(MicrosoftEntraID);

/** Whether the provider vouches for the email address it returned. */
function emailVerified(provider: string, profile: Record<string, unknown> | undefined): boolean {
  if (!profile) return false;
  if (provider === "google") return profile.email_verified === true;
  // Entra ID work/school accounts carry a tenant-managed address; the
  // `xms_edov` claim marks a verified domain owner when present.
  if (provider === "microsoft-entra-id") return profile.xms_edov !== false;
  return false;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (!account || account.provider === "credentials") return true;
      const subject = account.providerAccountId;
      const linked = await db.userIdentity.findUnique({
        where: { provider_subject: { provider: account.provider, subject } },
      });
      if (linked) return true;

      const email = (user.email ?? (profile?.email as string | undefined))?.toLowerCase();
      if (!email || !emailVerified(account.provider, profile as Record<string, unknown> | undefined)) {
        return "/login?error=OAuthEmailUnverified";
      }
      const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
      if (!existing) return "/login?error=OAuthNoAccount";
      await db.userIdentity.create({ data: { userId: existing.id, provider: account.provider, subject, email } });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && account.provider !== "credentials") {
        // Replace the provider's id with our own user id.
        const identity = await db.userIdentity.findUnique({
          where: { provider_subject: { provider: account.provider, subject: account.providerAccountId } },
          select: { userId: true },
        });
        const dbUser = identity
          ? await db.user.findUnique({ where: { id: identity.userId }, select: { id: true, role: true, email: true, name: true } })
          : null;
        if (dbUser) {
          token.sub = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role;
        }
        return token;
      }
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: unknown }).role = token.role;
        if (token.sub) session.user.id = token.sub;
      }
      return session;
    },
  },
});
