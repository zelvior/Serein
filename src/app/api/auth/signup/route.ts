import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "@/lib/db/firebase.admin";
import { isValidEmail, isValidPassword } from "@/lib/security/validation";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({}));

  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  if (!isValidEmail(normalizedEmail)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  try {
    // Firebase Auth stores and verifies the password itself — no hashing on our end.
    await getAuth(getAdminApp()).createUser({
      email: normalizedEmail,
      password,
      displayName: typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : undefined,
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }
    if (code === "auth/invalid-password") {
      return NextResponse.json({ error: "weak_password" }, { status: 400 });
    }
    return NextResponse.json({ error: "signup_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
