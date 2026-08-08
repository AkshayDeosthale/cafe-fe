import { getSettings } from "@/lib/actions/people";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsClient } from "@/features/settings/client";


export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Settings" description="Restaurant info, billing, hours, printing" />
      <SettingsClient settings={settings} />
    </div>
  );
}

export const dynamic = "force-dynamic";
