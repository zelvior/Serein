import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection(COLLECTIONS.conversations)
    .where("userId", "==", session.user.id)
    .orderBy("updatedAt", "desc")
    .limit(100)
    .get();

  const conversations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ conversations });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { title } = await req.json().catch(() => ({}));
  const now = new Date().toISOString();

  const ref = await adminDb.collection(COLLECTIONS.conversations).add({
    userId: session.user.id,
    title: typeof title === "string" && title.trim() ? title.trim().slice(0, 80) : "New chat",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id: ref.id });
}
