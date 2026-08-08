import { getSuppliers } from "@/lib/actions/purchases";
import { getIngredients } from "@/lib/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { SuppliersClient } from "@/features/suppliers/client";

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [data, ingredients] = await Promise.all([
    getSuppliers({ search: sp.search, page: Number(sp.page ?? 1), pageSize: 10 }),
    getIngredients({ pageSize: 100 }),
  ]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Suppliers" description="Vendor contacts, GSTIN and purchase history" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search name, phone, GSTIN…" />
      </div>
      <SuppliersClient suppliers={data.items} ingredients={ingredients.items} />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
