import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { isOwner } from "@/lib/security/permissions";

async function loadOwnedConversation(conversationId: string, userId: string) {
  const doc = await adminDb.collection(COLLECTIONS.conversations).doc(conversationId).get();
  if (!doc.exists || !isOwner(doc.data()?.userId, userId)) return null;
  return doc;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const doc = await loadOwnedConversation(conversationId, session.user.id);
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const messagesSnap = await adminDb
    .collection(COLLECTIONS.conversations)
    .doc(conversationId)
    .collection(COLLECTIONS.messages)
    .orderBy("createdAt", "asc")
    .limit(500)
    .get();

  const messages = messagesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ conversation: { id: doc.id, ...doc.data() }, messages });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const doc = await loadOwnedConversation(conversationId, session.user.id);
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { title } = await req.json().catch(() => ({}));
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  }

  await doc.ref.set({ title: title.trim().slice(0, 80), updatedAt: new Date().toISOString() }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const doc = await loadOwnedConversation(conversationId, session.user.id);
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const messagesSnap = await doc.ref.collection(COLLECTIONS.messages).get();
  const batch = adminDb.batch();
  messagesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc.ref);
  await batch.commit();

  return NextResponse.json({ ok: true });
}
