import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { hashPassword, isValidEmail, isValidPassword } from "@/lib/security/password";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({}));

  const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
  if (!isValidEmail(normalizedEmail)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  const existing = await adminDb
    .collection(COLLECTIONS.users)
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "email_taken" }, { status: 409 });
  }

  const ref = adminDb.collection(COLLECTIONS.users).doc();
  await ref.set({
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 100) : null,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
