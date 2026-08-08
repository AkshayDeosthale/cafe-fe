import { getKitchenQueue, getTables } from "@/lib/actions/orders";
import { PageHeader } from "@/components/shared/page-header";
import { KitchenClient } from "@/features/kitchen/client";


export default async function KitchenPage() {
  const [orders, tables] = await Promise.all([getKitchenQueue(), getTables()]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Kitchen Display" description="Incoming KOTs — start, ready, serve" />
      <KitchenClient orders={orders} tables={tables} />
    </div>
  );
}

export const dynamic = "force-dynamic";
