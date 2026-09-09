import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SCENARIOS } from "@/lib/prompt/scenarios";

export default async function PracticeScenarioPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/practice");

  const { scenarioId } = await params;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) notFound();

  return (
    <ChatWindow
      scenarioId={scenario.id}
      placeholder="Start the conversation…"
      emptyLabel={scenario.label}
    />
  );
}
