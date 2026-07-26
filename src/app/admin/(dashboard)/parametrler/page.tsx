import { getPublicSettings } from "@/actions/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getPublicSettings();
  return (
    <div>
      <h1 className="display-font text-3xl mb-8">Parametrlər</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
