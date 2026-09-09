import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { encrypt } from "@/lib/security/encryption";
import { OpenAICompatibleProvider } from "@/lib/ai/providers/byok";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection(COLLECTIONS.providers)
    .where("userId", "==", session.user.id)
    .get();

  const providers = snap.docs.map((d) => ({
    id: d.id,
    provider: d.data().provider,
    baseUrl: d.data().baseUrl,
    createdAt: d.data().createdAt,
  }));

  return NextResponse.json({ providers });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider, apiKey, baseUrl } = await req.json();
  if (!provider || !apiKey || typeof apiKey !== "string") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const resolvedBaseUrl = baseUrl || "https://api.openai.com/v1";
  const client = new OpenAICompatibleProvider(apiKey, resolvedBaseUrl);
  const valid = await client.validateCredentials().catch(() => false);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  const docId = `${session.user.id}_${provider}`;
  await adminDb
    .collection(COLLECTIONS.providers)
    .doc(docId)
    .set({
      userId: session.user.id,
      provider,
      baseUrl: resolvedBaseUrl,
      encryptedKey: encrypt(apiKey),
      createdAt: new Date().toISOString(),
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { provider } = await req.json();
  const docId = `${session.user.id}_${provider}`;
  await adminDb.collection(COLLECTIONS.providers).doc(docId).delete();

  return NextResponse.json({ ok: true });
}
