import { db } from "./store";
import type { Order } from "@/lib/types";

function inRange(o: Order, from?: string, to?: string): boolean {
  if (o.status === "cancelled") return false;
  if (from && o.createdAt < from) return false;
  if (to && o.createdAt > to + "T23:59:59") return false;
  return true;
}

export function reportSummary(from?: string, to?: string) {
  const orders = db().orders.filter((o) => inRange(o, from, to));
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const tax = orders.reduce((s, o) => s + o.taxAmount, 0);
  return {
    revenue: Math.round(revenue * 100) / 100,
    orders: orders.length,
    avgOrderValue: orders.length ? Math.round((revenue / orders.length) * 100) / 100 : 0,
    gstCollected: Math.round(tax * 100) / 100,
  };
}

export function salesByDay(from?: string, to?: string): { date: string; revenue: number; orders: number }[] {
  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of db().orders.filter((o) => inRange(o, from, to))) {
    const day = o.createdAt.slice(0, 10);
    const e = map.get(day) ?? { revenue: 0, orders: 0 };
    e.revenue += o.total;
    e.orders += 1;
    map.set(day, e);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, e]) => ({ date, revenue: Math.round(e.revenue * 100) / 100, orders: e.orders }));
}

export function topProducts(limit = 5, from?: string, to?: string) {
  const d = db();
  const map = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of d.orders.filter((o) => inRange(o, from, to))) {
    for (const item of o.items) {
      const e = map.get(item.productId) ?? { name: item.name, qty: 0, revenue: 0 };
      e.qty += item.qty;
      e.revenue += item.price * item.qty;
      map.set(item.productId, e);
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, limit);
}

export function categorySplit(from?: string, to?: string) {
  const d = db();
  const map = new Map<string, number>();
  for (const o of d.orders.filter((o) => inRange(o, from, to))) {
    for (const item of o.items) {
      const product = d.products.find((p) => p.id === item.productId);
      const cat = d.categories.find((c) => c.id === product?.categoryId)?.name ?? "Other";
      map.set(cat, (map.get(cat) ?? 0) + item.price * item.qty);
    }
  }
  return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

export function paymentSplit(from?: string, to?: string) {
  const map = new Map<string, number>();
  for (const o of db().orders.filter((o) => inRange(o, from, to))) {
    for (const p of o.payments) map.set(p.method, (map.get(p.method) ?? 0) + p.amount);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
}

export function inventoryUsage(from?: string, to?: string) {
  const d = db();
  return d.ingredients
    .map((ing) => {
      const used = d.movements
        .filter((m) => m.ingredientId === ing.id && m.type === "sale")
        .filter((m) => (!from || m.createdAt >= from) && (!to || m.createdAt <= to + "T23:59:59"))
        .reduce((s, m) => s + Math.abs(m.qty), 0);
      const wasted = d.movements
        .filter((m) => m.ingredientId === ing.id && m.type === "waste")
        .filter((m) => (!from || m.createdAt >= from) && (!to || m.createdAt <= to + "T23:59:59"))
        .reduce((s, m) => s + Math.abs(m.qty), 0);
      return { id: ing.id, name: ing.name, unit: ing.unit, used, wasted };
    })
    .filter((r) => r.used > 0 || r.wasted > 0);
}

export function toCSV(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

// ---------- Dashboard ----------
export function dashboardStats() {
  const d = db();
  const today = new Date().toISOString().slice(0, 10);
  const todaysOrders = d.orders.filter((o) => o.createdAt.startsWith(today) && o.status !== "cancelled");
  return {
    todaySales: Math.round(todaysOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
    todayOrders: todaysOrders.length,
    lowStock: d.ingredients.filter((i) => i.stock <= i.reorderLevel).length,
    activeTables: d.tables.filter((t) => t.status === "occupied").length,
    totalTables: d.tables.length,
    recentOrders: d.orders.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    lowStockItems: d.ingredients.filter((i) => i.stock <= i.reorderLevel),
    topProducts: topProducts(5),
    sales: salesByDay(),
  };
}
