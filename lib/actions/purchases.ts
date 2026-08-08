"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/purchases";
import type { PurchaseQuery } from "@/lib/data/purchases";
import { purchaseSchema, supplierSchema } from "@/lib/types";
import type { PurchaseInput, Query, SupplierInput } from "@/lib/types";

export async function getSuppliers(q: Query) {
  return repo.listSuppliers(q);
}

export async function saveSupplier(input: SupplierInput, id?: string) {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateSupplier(id, parsed.data) : repo.createSupplier(parsed.data);
  if (result.ok) revalidatePath("/suppliers");
  return result;
}

export async function removeSupplier(id: string) {
  const result = repo.deleteSupplier(id);
  if (result.ok) revalidatePath("/suppliers");
  return result;
}

export async function getSupplierStats(id: string) {
  return repo.supplierStats(id);
}

export async function getPurchases(q: PurchaseQuery) {
  return repo.listPurchases(q);
}

export async function savePurchase(input: PurchaseInput) {
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = repo.createPurchase(parsed.data);
  if (result.ok) {
    revalidatePath("/purchases");
    revalidatePath("/inventory");
  }
  return result;
}

export async function removePurchase(id: string) {
  const result = repo.deletePurchase(id);
  if (result.ok) {
    revalidatePath("/purchases");
    revalidatePath("/inventory");
  }
  return result;
}
