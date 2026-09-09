import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { UserProfile, MemoryItem } from "@/types/profile";
import { buildSystemPrompt } from "@/lib/prompt/builder";
import { selectRelevantMemories } from "@/lib/memory";
import { OpenRouterPoolProvider } from "@/lib/ai/providers/openrouter-pool";
import { resolveModelId } from "@/lib/ai/models";
import { OpenAICompatibleProvider } from "@/lib/ai/providers/byok";
import { checkAndIncrementRateLimit, validateMessage, RateLimitExceededError } from "@/lib/security/rateLimit";
import { decrypt } from "@/lib/security/encryption";
import { SCENARIOS, PRACTICE_SYSTEM_SUFFIX } from "@/lib/prompt/scenarios";
import { detectCrisis, CRISIS_RESPONSE_INSTRUCTIONS } from "@/lib/safety/crisis";
import { extractMemories } from "@/lib/memory/extract";
import { persistInferredMemories } from "@/lib/memory/persist";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  const { message, conversationId, scenarioId } = await req.json();
  if (!validateMessage(message)) {
    return new Response("invalid_message", { status: 400 });
  }

  try {
    await checkAndIncrementRateLimit(userId);
  } catch (e) {
    if (e instanceof RateLimitExceededError) {
      return new Response("You've hit today's message limit. Try again tomorrow.", { status: 429 });
    }
    throw e;
  }

  const profileSnap = await adminDb.collection(COLLECTIONS.profiles).doc(userId).get();
  if (!profileSnap.exists) {
    return new Response("profile_missing", { status: 400 });
  }
  const profile = profileSnap.data() as UserProfile;

  const memorySnap = await adminDb
    .collection(COLLECTIONS.memories)
    .where("userId", "==", userId)
    .limit(50)
    .get();
  const memories = memorySnap.docs.map((d) => d.data() as MemoryItem);
  const relevant = selectRelevantMemories(memories, message);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const isCrisis = detectCrisis(message);

  const contextParts = [
    scenario ? `${PRACTICE_SYSTEM_SUFFIX}\n\nSCENARIO: ${scenario.prompt}` : "",
    isCrisis ? CRISIS_RESPONSE_INSTRUCTIONS : "",
  ].filter(Boolean);
  const systemPrompt = buildSystemPrompt(profile, relevant, contextParts.join("\n\n"));

  const byokSnap = await adminDb
    .collection(COLLECTIONS.providers)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  let byokProvider: OpenAICompatibleProvider | undefined;
  if (!byokSnap.empty) {
    const doc = byokSnap.docs[0].data();
    byokProvider = new OpenAICompatibleProvider(decrypt(doc.encryptedKey), doc.baseUrl);
  }

  const routerFallbackPool = new OpenRouterPoolProvider();
  const openRouterProvider = routerFallbackPool.available ? routerFallbackPool : undefined;

  const activeProvider = byokProvider ?? openRouterProvider;
  if (!activeProvider) {
    return new Response("no_provider_configured", { status: 503 });
  }
  const activeModel = byokProvider ? "gpt-4o-mini" : resolveModelId(profile.preferredModelAlias);

  let stream;
  try {
    stream = activeProvider.stream({
      model: activeModel,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }],
    });
  } catch {
    return new Response("no_provider_configured", { status: 503 });
  }

  const encoder = new TextEncoder();
  let full = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[Serein hit a connection issue. Try again.]"));
      } finally {
        controller.close();
        if (conversationId && full) {
          await adminDb
            .collection(COLLECTIONS.conversations)
            .doc(conversationId)
            .collection(COLLECTIONS.messages)
            .add({ role: "assistant", content: full, createdAt: new Date().toISOString() });
        }
        // Learned-context memory: skip during crisis/practice exchanges, non-blocking best-effort.
        if (full && !isCrisis && !scenario) {
          extractMemories(activeProvider, activeModel, message, full)
            .then((extracted) => persistInferredMemories(userId, extracted))
            .catch(() => {});
        }
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
