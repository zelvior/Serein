import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [profile, memories, conversations] = await Promise.all([
    adminDb.collection(COLLECTIONS.profiles).doc(userId).get(),
    adminDb.collection(COLLECTIONS.memories).where("userId", "==", userId).get(),
    adminDb.collection(COLLECTIONS.conversations).where("userId", "==", userId).get(),
  ]);

  return NextResponse.json({
    profile: profile.data() ?? null,
    memories: memories.docs.map((d) => d.data()),
    conversations: conversations.docs.map((d) => ({ id: d.id, ...d.data() })),
  });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = session.user.id;
  const { confirm } = await req.json().catch(() => ({}));
  if (confirm !== "DELETE") {
    return NextResponse.json({ error: "confirmation_required" }, { status: 400 });
  }

  const batch = adminDb.batch();
  const [memories, providers, conversations] = await Promise.all([
    adminDb.collection(COLLECTIONS.memories).where("userId", "==", userId).get(),
    adminDb.collection(COLLECTIONS.providers).where("userId", "==", userId).get(),
    adminDb.collection(COLLECTIONS.conversations).where("userId", "==", userId).get(),
  ]);
  memories.docs.forEach((d) => batch.delete(d.ref));
  providers.docs.forEach((d) => batch.delete(d.ref));
  conversations.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection(COLLECTIONS.profiles).doc(userId));
  await batch.commit();

  return NextResponse.json({ ok: true });
}
