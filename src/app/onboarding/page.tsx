import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/onboarding");
  return <OnboardingFlow />;
}
