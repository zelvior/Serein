import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { MODEL_REGISTRY, publicModelList } from "@/lib/ai/models";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const profileSnap = await adminDb.collection(COLLECTIONS.profiles).doc(session.user.id).get();
  const selected = (profileSnap.data()?.preferredModelAlias as string) ?? MODEL_REGISTRY[0].alias;

  return NextResponse.json({ models: publicModelList(), selected });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { alias } = await req.json();
  const valid = MODEL_REGISTRY.some((m) => m.alias === alias);
  if (!valid) return NextResponse.json({ error: "invalid_model" }, { status: 400 });

  await adminDb
    .collection(COLLECTIONS.profiles)
    .doc(session.user.id)
    .set({ preferredModelAlias: alias, updatedAt: new Date().toISOString() }, { merge: true });

  return NextResponse.json({ ok: true });
}
