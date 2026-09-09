import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { isStorable } from "@/lib/memory";
import { isOwner } from "@/lib/security/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection(COLLECTIONS.memories)
    .where("userId", "==", session.user.id)
    .get();

  const memories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { content, category } = await req.json();
  if (!content || typeof content !== "string" || content.length > 500) {
    return NextResponse.json({ error: "invalid_content" }, { status: 400 });
  }
  if (!isStorable(content)) {
    return NextResponse.json({ error: "content_not_storable" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const ref = await adminDb.collection(COLLECTIONS.memories).add({
    userId: session.user.id,
    category: category ?? "preference",
    content,
    source: "explicit",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: ref.id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const doc = await adminDb.collection(COLLECTIONS.memories).doc(id).get();
  if (!doc.exists || !isOwner(doc.data()?.userId, session.user.id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await adminDb.collection(COLLECTIONS.memories).doc(id).delete();

  return NextResponse.json({ ok: true });
}
