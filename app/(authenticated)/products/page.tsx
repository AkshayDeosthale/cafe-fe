import { getCategories, getProducts } from "@/lib/actions/catalog";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { ProductsClient } from "@/features/products/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [data, categories] = await Promise.all([
    getProducts({
      search: sp.search,
      categoryId: sp.category,
      available: sp.available === "" ? undefined : sp.available === undefined ? undefined : sp.available === "true",
      page: Number(sp.page ?? 1),
      pageSize: 10,
    }),
    getCategories(),
  ]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Products" description="Menu items with price, GST, SKU and availability" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search name, SKU, barcode…" />
      </div>
      <ProductsClient products={data.items} categories={categories} />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
