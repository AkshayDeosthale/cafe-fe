import { getCategories } from "@/lib/actions/catalog";
import { PageHeader } from "@/components/shared/page-header";
import { CategoriesClient } from "@/features/categories/client";


export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Categories" description="Menu grouping — coffee, bakery, food…" />
      <CategoriesClient categories={categories} />
    </div>
  );
}

export const dynamic = "force-dynamic";
