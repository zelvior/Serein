import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/settings");
  return children;
}
