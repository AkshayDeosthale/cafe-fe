import { db, matchesSearch, paginate, uid } from "./store";
import type {
  Category,
  CategoryInput,
  Paged,
  Product,
  ProductInput,
  Query,
} from "@/lib/types";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

// ---------- Categories ----------
export function listCategories(): (Category & { productCount: number })[] {
  const d = db();
  return d.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({
      ...c,
      productCount: d.products.filter((p) => p.categoryId === c.id).length,
    }));
}

export function createCategory(input: CategoryInput): Result<Category> {
  const d = db();
  if (d.categories.some((c) => c.name.toLowerCase() === input.name.toLowerCase()))
    return { ok: false, error: "Category name already exists" };
  const cat: Category = { ...input, id: uid("cat") };
  d.categories.push(cat);
  return { ok: true, data: cat };
}

export function updateCategory(id: string, input: CategoryInput): Result<Category> {
  const d = db();
  const cat = d.categories.find((c) => c.id === id);
  if (!cat) return { ok: false, error: "Category not found" };
  if (d.categories.some((c) => c.id !== id && c.name.toLowerCase() === input.name.toLowerCase()))
    return { ok: false, error: "Category name already exists" };
  Object.assign(cat, input);
  return { ok: true, data: cat };
}

export function deleteCategory(id: string): Result<null> {
  const d = db();
  if (d.products.some((p) => p.categoryId === id))
    return { ok: false, error: "Category has products — reassign or delete them first" };
  d.categories = d.categories.filter((c) => c.id !== id);
  return { ok: true, data: null };
}

// ---------- Products ----------
export type ProductQuery = Query & { categoryId?: string; available?: boolean };

export function listProducts(q: ProductQuery = {}): Paged<Product> {
  let items = db().products.slice();
  if (q.categoryId) items = items.filter((p) => p.categoryId === q.categoryId);
  if (q.available !== undefined) items = items.filter((p) => p.available === q.available);
  items = items.filter((p) => matchesSearch([p.name, p.sku, p.barcode], q.search));
  items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q);
}

export function getProduct(id: string): Product | undefined {
  return db().products.find((p) => p.id === id);
}

export function createProduct(input: ProductInput): Result<Product> {
  const d = db();
  if (input.sku && d.products.some((p) => p.sku === input.sku))
    return { ok: false, error: "SKU already exists" };
  if (!d.categories.some((c) => c.id === input.categoryId))
    return { ok: false, error: "Category not found" };
  const product: Product = { ...input, id: uid("p") };
  d.products.push(product);
  return { ok: true, data: product };
}

export function updateProduct(id: string, input: ProductInput): Result<Product> {
  const d = db();
  const product = d.products.find((p) => p.id === id);
  if (!product) return { ok: false, error: "Product not found" };
  if (input.sku && d.products.some((p) => p.id !== id && p.sku === input.sku))
    return { ok: false, error: "SKU already exists" };
  Object.assign(product, input);
  return { ok: true, data: product };
}

export function toggleProductAvailability(id: string): Result<Product> {
  const product = db().products.find((p) => p.id === id);
  if (!product) return { ok: false, error: "Product not found" };
  product.available = !product.available;
  return { ok: true, data: product };
}

export function deleteProduct(id: string): Result<null> {
  const d = db();
  const active = d.orders.some(
    (o) =>
      !["completed", "cancelled"].includes(o.status) &&
      o.items.some((i) => i.productId === id)
  );
  if (active) return { ok: false, error: "Product is part of an open order" };
  d.products = d.products.filter((p) => p.id !== id);
  d.recipes = d.recipes.filter((r) => r.productId !== id);
  return { ok: true, data: null };
}
