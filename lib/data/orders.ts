import { z } from "zod";
import { db, matchesSearch, paginate, uid } from "./store";
import type { Result } from "./catalog";
import { applyMovement } from "./inventory";
import type {
  CafeTable,
  CartLine,
  Order,
  OrderItem,
  OrderStatus,
  Paged,
  Query,
  TableInput,
  TableStatus,
} from "@/lib/types";
import { checkoutSchema } from "@/lib/types";
import { cartTotals } from "@/lib/utils/totals";

export { cartTotals };

// ---------- Checkout ----------
export type CheckoutInput = z.infer<typeof checkoutSchema>;

const OPEN_STATUSES: OrderStatus[] = ["pending", "preparing", "ready", "served"];

export function checkout(input: CheckoutInput): Result<Order> {
  const d = db();
  // build items from product master (never trust client prices)
  const items: OrderItem[] = [];
  const cartLines: CartLine[] = [];
  for (const line of input.lines) {
    const product = d.products.find((p) => p.id === line.productId);
    if (!product) return { ok: false, error: "Product not found" };
    if (!product.available) return { ok: false, error: `${product.name} is unavailable` };
    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : undefined;
    if (line.variantId && !variant) return { ok: false, error: "Variant not found" };
    const price = product.price + (variant?.priceDelta ?? 0);
    const name = variant ? `${product.name} (${variant.name})` : product.name;
    items.push({ productId: product.id, variantId: variant?.id, name, price, qty: line.qty, note: line.note });
    cartLines.push({ productId: product.id, variantId: variant?.id, name, price, qty: line.qty, note: line.note, gstRate: product.gstRate });
  }

  // stock check via recipes — validate all before deducting any
  const deductions = new Map<string, number>();
  for (const item of items) {
    const recipe = d.recipes.find((r) => r.productId === item.productId);
    if (!recipe) continue;
    for (const rl of recipe.lines) {
      deductions.set(rl.ingredientId, (deductions.get(rl.ingredientId) ?? 0) + rl.qty * item.qty);
    }
  }
  for (const [ingId, qty] of deductions) {
    const ing = d.ingredients.find((i) => i.id === ingId);
    if (!ing) return { ok: false, error: "Ingredient missing" };
    if (ing.stock < qty) return { ok: false, error: `Insufficient stock: ${ing.name}` };
  }

  const totals = cartTotals(cartLines, input.discountType, input.discountValue);
  const paid = input.payments.reduce((s, p) => s + p.amount, 0);
  if (Math.abs(paid - totals.total) > 0.01)
    return { ok: false, error: `Payment ₹${paid.toFixed(2)} does not match total ₹${totals.total.toFixed(2)}` };

  const order: Order = {
    id: uid("o"),
    invoiceNo: `${d.settings.invoicePrefix}${String(d.counters.invoice).padStart(4, "0")}`,
    tableId: input.tableId,
    customerId: input.customerId,
    items,
    status: "pending",
    discountType: input.discountType,
    discountValue: input.discountValue,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    payments: input.payments,
    createdAt: new Date().toISOString(),
  };
  d.counters.invoice += 1;

  for (const [ingId, qty] of deductions) {
    applyMovement(ingId, "sale", -qty, `Order ${order.invoiceNo}`, order.id);
  }

  if (input.tableId) {
    const table = d.tables.find((t) => t.id === input.tableId);
    if (table) {
      table.status = "occupied";
      table.currentOrderId = order.id;
    }
  }
  d.orders.push(order);
  return { ok: true, data: order };
}

// ---------- Orders ----------
export type OrderQuery = Query & { status?: OrderStatus; method?: string; from?: string; to?: string };

export function listOrders(q: OrderQuery = {}): Paged<Order> {
  let items = db().orders.slice();
  if (q.status) items = items.filter((o) => o.status === q.status);
  if (q.method) items = items.filter((o) => o.payments.some((p) => p.method === q.method));
  if (q.from) items = items.filter((o) => o.createdAt >= q.from!);
  if (q.to) items = items.filter((o) => o.createdAt <= q.to! + "T23:59:59");
  items = items.filter((o) => {
    const customer = db().customers.find((c) => c.id === o.customerId);
    return matchesSearch([o.invoiceNo, customer?.name ?? ""], q.search);
  });
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return paginate(items, q);
}

export function getOrder(id: string): Order | undefined {
  return db().orders.find((o) => o.id === id);
}

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function transitionOrder(id: string, next: OrderStatus): Result<Order> {
  const order = db().orders.find((o) => o.id === id);
  if (!order) return { ok: false, error: "Order not found" };
  if (!TRANSITIONS[order.status].includes(next))
    return { ok: false, error: `Cannot move ${order.status} → ${next}` };
  if (next === "cancelled") {
    // restock ingredients
    const d = db();
    for (const item of order.items) {
      const recipe = d.recipes.find((r) => r.productId === item.productId);
      if (!recipe) continue;
      for (const rl of recipe.lines) {
        applyMovement(rl.ingredientId, "correction", rl.qty * item.qty, `Cancel ${order.invoiceNo}`, order.id);
      }
    }
  }
  order.status = next;
  if (next === "completed" || next === "cancelled") {
    const table = db().tables.find((t) => t.currentOrderId === id);
    if (table) {
      table.status = next === "completed" ? "cleaning" : "available";
      table.currentOrderId = undefined;
    }
  }
  return { ok: true, data: order };
}

export function kitchenQueue(): Order[] {
  return db()
    .orders.filter((o) => OPEN_STATUSES.includes(o.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// ---------- Tables ----------
export function listTables(): CafeTable[] {
  return db().tables.slice().sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

export function createTable(input: TableInput): Result<CafeTable> {
  if (db().tables.some((t) => t.name === input.name))
    return { ok: false, error: "Table name exists" };
  const table: CafeTable = { ...input, id: uid("t"), status: "available" };
  db().tables.push(table);
  return { ok: true, data: table };
}

export function setTableStatus(id: string, status: TableStatus): Result<CafeTable> {
  const table = db().tables.find((t) => t.id === id);
  if (!table) return { ok: false, error: "Table not found" };
  if (status === "available" && table.currentOrderId)
    return { ok: false, error: "Table has an open order" };
  table.status = status;
  return { ok: true, data: table };
}

export function deleteTable(id: string): Result<null> {
  const d = db();
  const table = d.tables.find((t) => t.id === id);
  if (!table) return { ok: false, error: "Table not found" };
  if (table.currentOrderId) return { ok: false, error: "Table has an open order" };
  d.tables = d.tables.filter((t) => t.id !== id);
  return { ok: true, data: null };
}

export function transferOrder(fromTableId: string, toTableId: string): Result<null> {
  const d = db();
  const from = d.tables.find((t) => t.id === fromTableId);
  const to = d.tables.find((t) => t.id === toTableId);
  if (!from || !to) return { ok: false, error: "Table not found" };
  if (!from.currentOrderId) return { ok: false, error: "No order on source table" };
  if (to.status !== "available") return { ok: false, error: "Target table not available" };
  const order = d.orders.find((o) => o.id === from.currentOrderId);
  if (order) order.tableId = to.id;
  to.status = "occupied";
  to.currentOrderId = from.currentOrderId;
  from.status = "cleaning";
  from.currentOrderId = undefined;
  return { ok: true, data: null };
}

export function mergeTables(sourceId: string, targetId: string): Result<null> {
  // merge = move source's open order onto target (target keeps its order only if none — keep lazy: source must have order, target must be occupied without blocking)
  const d = db();
  const source = d.tables.find((t) => t.id === sourceId);
  const target = d.tables.find((t) => t.id === targetId);
  if (!source || !target) return { ok: false, error: "Table not found" };
  if (!source.currentOrderId) return { ok: false, error: "No order on source table" };
  if (target.currentOrderId) return { ok: false, error: "Target already has an order" };
  const order = d.orders.find((o) => o.id === source.currentOrderId);
  if (order) order.tableId = target.id;
  target.status = "occupied";
  target.currentOrderId = source.currentOrderId;
  source.status = "cleaning";
  source.currentOrderId = undefined;
  return { ok: true, data: null };
}
