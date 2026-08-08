import { getOrders, getTables } from "@/lib/actions/orders";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { OrdersClient } from "@/features/orders/client";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [data, tables] = await Promise.all([
    getOrders({
      search: sp.search,
      status: sp.status as never,
      method: sp.method,
      from: sp.from,
      to: sp.to,
      page: Number(sp.page ?? 1),
      pageSize: 10,
    }),
    getTables(),
  ]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Orders" description="Every bill — status, payment, KOT timeline" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search invoice or customer…" />
      </div>
      <OrdersClient orders={data.items} tables={tables} filters={sp} />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
