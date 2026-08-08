import { getIngredients } from "@/lib/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { InventoryClient } from "@/features/inventory/client";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const data = await getIngredients({
    search: sp.search,
    lowStockOnly: sp.low === "true",
    page: Number(sp.page ?? 1),
    pageSize: 10,
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Inventory" description="Ingredient stock, units, adjustments and waste" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search ingredient or category…" />
      </div>
      <InventoryClient ingredients={data.items} lowOnly={sp.low === "true"} />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
