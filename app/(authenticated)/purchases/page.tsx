import { getPurchases, getSuppliers } from "@/lib/actions/purchases";
import { getIngredients } from "@/lib/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { PurchasesClient } from "@/features/purchases/client";

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [data, suppliers, ingredients] = await Promise.all([
    getPurchases({
      search: sp.search,
      supplierId: sp.supplier,
      from: sp.from,
      to: sp.to,
      page: Number(sp.page ?? 1),
      pageSize: 10,
    }),
    getSuppliers({ pageSize: 100 }),
    getIngredients({ pageSize: 100 }),
  ]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Purchases" description="Stock-in entries — supplier invoice adds to inventory" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search invoice no…" />
      </div>
      <PurchasesClient
        purchases={data.items}
        suppliers={suppliers.items}
        ingredients={ingredients.items}
        filters={{ supplier: sp.supplier, from: sp.from, to: sp.to }}
      />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
