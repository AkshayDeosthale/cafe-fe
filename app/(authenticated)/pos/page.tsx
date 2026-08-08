import { getCategories, getProducts } from "@/lib/actions/catalog";
import { getTables } from "@/lib/actions/orders";
import { getCustomers } from "@/lib/actions/people";
import { PosClient } from "@/features/pos/client";

export default async function PosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [categories, products, tables, customers] = await Promise.all([
    getCategories(),
    getProducts({ available: true, pageSize: 200 }),
    getTables(),
    getCustomers({ pageSize: 200 }),
  ]);
  return (
    <PosClient
      categories={categories}
      products={products.items}
      tables={tables}
      customers={customers.items}
      initialTableId={sp.table}
    />
  );
}
