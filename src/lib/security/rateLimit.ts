import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";

const DAILY_MESSAGE_LIMIT = 200;
const MAX_MESSAGE_LENGTH = 4000;

export class RateLimitExceededError extends Error {
  constructor() {
    super("rate_limit_exceeded");
  }
}

function todayKey(userId: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${userId}_${date}`;
}

export async function checkAndIncrementRateLimit(userId: string): Promise<void> {
  const ref = adminDb.collection(COLLECTIONS.usage).doc(todayKey(userId));
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? (snap.data()?.requestCount ?? 0) : 0;
    if (count >= DAILY_MESSAGE_LIMIT) {
      throw new RateLimitExceededError();
    }
    tx.set(
      ref,
      {
        userId,
        date: new Date().toISOString().slice(0, 10),
        requestCount: count + 1,
      },
      { merge: true }
    );
  });
}

export function validateMessage(message: unknown): message is string {
  return typeof message === "string" && message.length > 0 && message.length <= MAX_MESSAGE_LENGTH;
}
