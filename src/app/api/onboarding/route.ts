import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { UserProfile } from "@/types/profile";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const now = new Date().toISOString();

  const profile: UserProfile = {
    userId: session.user.id ?? "",
    communication: {
      responseLength: body.responseLength ?? "normal",
      tone: body.tone ?? "calm",
      humor: body.humor ?? "light",
      emojiLevel: "low",
    },
    support: {
      style: body.supportStyle ?? "both",
      advicePreference: "when_useful",
    },
    social: {
      introversion: body.introversion ?? "unsure",
      goals: body.goals ?? [],
      struggles: body.struggles ?? [],
    },
    language: body.language ?? "english",
    tts: {
      enabled: false,
      speed: 1,
      autoplay: false,
    },
    appearance: {
      theme: "dark",
    },
    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection(COLLECTIONS.profiles).doc(profile.userId).set(profile);

  return NextResponse.json({ ok: true });
}
