import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { isOwner } from "@/lib/security/permissions";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/chat");

  const profileSnap = await adminDb.collection(COLLECTIONS.profiles).doc(session.user.id).get();
  if (!profileSnap.exists) redirect("/onboarding");

  const { conversationId } = await params;
  const convoSnap = await adminDb.collection(COLLECTIONS.conversations).doc(conversationId).get();
  if (!convoSnap.exists || !isOwner(convoSnap.data()?.userId, session.user.id)) {
    notFound();
  }

  return <ChatWindow conversationId={conversationId} showSidebar />;
}
