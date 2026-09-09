import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { adminDb } from "@/lib/db/firebase.admin";
import { COLLECTIONS } from "@/lib/db/schema";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/chat");

  const profileSnap = await adminDb.collection(COLLECTIONS.profiles).doc(session.user.id).get();
  if (!profileSnap.exists) redirect("/onboarding");

  return <ChatWindow />;
}
