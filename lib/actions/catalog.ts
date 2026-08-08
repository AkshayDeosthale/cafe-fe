"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/catalog";
import { categorySchema, productSchema } from "@/lib/types";
import type { CategoryInput, ProductInput } from "@/lib/types";
import type { ProductQuery } from "@/lib/data/catalog";

export async function getCategories() {
  return repo.listCategories();
}

export async function saveCategory(input: CategoryInput, id?: string) {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateCategory(id, parsed.data) : repo.createCategory(parsed.data);
  if (result.ok) revalidatePath("/categories");
  return result;
}

export async function removeCategory(id: string) {
  const result = repo.deleteCategory(id);
  if (result.ok) revalidatePath("/categories");
  return result;
}

export async function getProducts(q: ProductQuery) {
  return repo.listProducts(q);
}

export async function saveProduct(input: ProductInput, id?: string) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateProduct(id, parsed.data) : repo.createProduct(parsed.data);
  if (result.ok) {
    revalidatePath("/products");
    revalidatePath("/pos");
  }
  return result;
}

export async function toggleProduct(id: string) {
  const result = repo.toggleProductAvailability(id);
  if (result.ok) {
    revalidatePath("/products");
    revalidatePath("/pos");
  }
  return result;
}

export async function removeProduct(id: string) {
  const result = repo.deleteProduct(id);
  if (result.ok) revalidatePath("/products");
  return result;
}
