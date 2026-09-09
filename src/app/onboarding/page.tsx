import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/onboarding");

  const { retake } = await searchParams;
  if (!retake) {
    // Returning users with a saved profile skip onboarding entirely — Serein already remembers them.
    const profileSnap = await adminDb.collection(COLLECTIONS.profiles).doc(session.user.id).get();
    if (profileSnap.exists) redirect("/chat");
  }

  return <OnboardingFlow />;
}
