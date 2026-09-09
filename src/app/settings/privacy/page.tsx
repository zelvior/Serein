import { SettingsShell } from "@/components/settings/SettingsShell";
import { PrivacySettings } from "@/components/settings/PrivacySettings";

export default function PrivacySettingsPage() {
  return (
    <SettingsShell>
      <PrivacySettings />
    </SettingsShell>
  );
}
