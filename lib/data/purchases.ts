import { db, matchesSearch, paginate, uid } from "./store";
import type { Result } from "./catalog";
import { applyMovement } from "./inventory";
import type { Paged, Purchase, PurchaseInput, Query, Supplier, SupplierInput } from "@/lib/types";

// ---------- Suppliers ----------
export function listSuppliers(q: Query = {}): Paged<Supplier> {
  let items = db().suppliers.slice();
  items = items.filter((s) => matchesSearch([s.name, s.phone, s.gstin], q.search));
  items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q);
}

export function createSupplier(input: SupplierInput): Result<Supplier> {
  if (db().suppliers.some((s) => s.phone === input.phone))
    return { ok: false, error: "Phone already registered" };
  const supplier: Supplier = { ...input, id: uid("s") };
  db().suppliers.push(supplier);
  return { ok: true, data: supplier };
}

export function updateSupplier(id: string, input: SupplierInput): Result<Supplier> {
  const d = db();
  const supplier = d.suppliers.find((s) => s.id === id);
  if (!supplier) return { ok: false, error: "Supplier not found" };
  if (d.suppliers.some((s) => s.id !== id && s.phone === input.phone))
    return { ok: false, error: "Phone already registered" };
  Object.assign(supplier, input);
  return { ok: true, data: supplier };
}

export function deleteSupplier(id: string): Result<null> {
  const d = db();
  if (d.purchases.some((p) => p.supplierId === id))
    return { ok: false, error: "Supplier has purchase history" };
  d.suppliers = d.suppliers.filter((s) => s.id !== id);
  return { ok: true, data: null };
}

// ---------- Purchases ----------
export type PurchaseQuery = Query & { supplierId?: string; from?: string; to?: string };

export function listPurchases(q: PurchaseQuery = {}): Paged<Purchase> {
  let items = db().purchases.slice();
  if (q.supplierId) items = items.filter((p) => p.supplierId === q.supplierId);
  if (q.from) items = items.filter((p) => p.date >= q.from!);
  if (q.to) items = items.filter((p) => p.date <= q.to!);
  items = items.filter((p) => matchesSearch([p.invoiceNo], q.search));
  items.sort((a, b) => b.date.localeCompare(a.date));
  return paginate(items, q);
}

export function createPurchase(input: PurchaseInput): Result<Purchase> {
  const d = db();
  if (!d.suppliers.some((s) => s.id === input.supplierId))
    return { ok: false, error: "Supplier not found" };
  if (d.purchases.some((p) => p.invoiceNo === input.invoiceNo))
    return { ok: false, error: "Invoice no already recorded" };
  const purchase: Purchase = {
    ...input,
    id: uid("po"),
    total: input.lines.reduce((s, l) => s + l.qty * l.unitCost, 0),
    createdAt: new Date().toISOString(),
  };
  // stock in — validate all before mutating any
  for (const line of input.lines) {
    if (!d.ingredients.some((i) => i.id === line.ingredientId))
      return { ok: false, error: "Ingredient not found" };
  }
  for (const line of input.lines) {
    const r = applyMovement(line.ingredientId, "purchase", line.qty, `PO ${input.invoiceNo}`, purchase.id);
    if (!r.ok) return r as Result<Purchase>;
  }
  d.purchases.push(purchase);
  return { ok: true, data: purchase };
}

export function deletePurchase(id: string): Result<null> {
  const d = db();
  const purchase = d.purchases.find((p) => p.id === id);
  if (!purchase) return { ok: false, error: "Purchase not found" };
  // reverse stock — refuse if any line would go negative
  for (const line of purchase.lines) {
    const ing = d.ingredients.find((i) => i.id === line.ingredientId);
    if (ing && ing.stock - line.qty < 0)
      return { ok: false, error: `Cannot delete: ${ing.name} stock already consumed` };
  }
  for (const line of purchase.lines) {
    applyMovement(line.ingredientId, "correction", -line.qty, `Reverse PO ${purchase.invoiceNo}`, purchase.id);
  }
  d.purchases = d.purchases.filter((p) => p.id !== id);
  return { ok: true, data: null };
}

export function supplierStats(supplierId: string): { purchases: Purchase[]; totalSpent: number } {
  const purchases = db().purchases.filter((p) => p.supplierId === supplierId);
  return { purchases, totalSpent: purchases.reduce((s, p) => s + p.total, 0) };
}
