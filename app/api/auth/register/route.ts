import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  accountType: z.enum(["Individual", "Company"]).optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const { name, email, password } = registerSchema.parse(raw);

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const slugBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
    const workspaceSlug = `${slugBase}-${Math.random().toString(36).substring(2, 7)}`;

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "EDITOR",
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug: workspaceSlug,
        },
      });

      await tx.membership.create({
        data: {
          userId: newUser.id,
          workspaceId: workspace.id,
          role: "OWNER",
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }
    console.error("[register error]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
