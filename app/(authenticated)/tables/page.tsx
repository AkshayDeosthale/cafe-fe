import { getTables } from "@/lib/actions/orders";
import { PageHeader } from "@/components/shared/page-header";
import { TablesClient } from "@/features/tables/client";


export default async function TablesPage() {
  const tables = await getTables();
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Tables" description="Floor layout — seat, reserve, clean, merge, transfer" />
      <TablesClient tables={tables} />
    </div>
  );
}

export const dynamic = "force-dynamic";
