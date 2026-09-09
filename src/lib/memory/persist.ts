import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { ExtractedMemory } from "./extract";

function similar(a: string, b: string): boolean {
  const na = a.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const nb = b.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  if (na === nb) return true;
  const wa = new Set(na.split(/\s+/));
  const wb = nb.split(/\s+/);
  const overlap = wb.filter((w) => wa.has(w)).length;
  return overlap / Math.max(wb.length, 1) > 0.7;
}

export async function persistInferredMemories(userId: string, extracted: ExtractedMemory[]): Promise<void> {
  if (extracted.length === 0) return;

  const existingSnap = await adminDb
    .collection(COLLECTIONS.memories)
    .where("userId", "==", userId)
    .get();
  const existingContents = existingSnap.docs.map((d) => d.data().content as string);

  const now = new Date().toISOString();
  const batch = adminDb.batch();
  let writes = 0;

  for (const mem of extracted) {
    const isDuplicate = existingContents.some((c) => similar(c, mem.content));
    if (isDuplicate) continue;
    const ref = adminDb.collection(COLLECTIONS.memories).doc();
    batch.set(ref, {
      userId,
      category: mem.category,
      content: mem.content,
      source: "inferred",
      createdAt: now,
      updatedAt: now,
    });
    writes++;
  }

  if (writes > 0) await batch.commit();
}
