import { beforeEach, describe, expect, it } from "vitest";
import { resetDB, db } from "@/lib/data/store";
import * as orders from "@/lib/data/orders";

beforeEach(() => resetDB());

describe("cartTotals", () => {
  const lines = [
    { productId: "p-latte", name: "Latte", price: 180, qty: 2, note: "", gstRate: 5 },
    { productId: "p-muffin", name: "Muffin", price: 130, qty: 1, note: "", gstRate: 5 },
  ];

  it("computes subtotal, tax, total", () => {
    const t = orders.cartTotals(lines, "percent", 0);
    expect(t.subtotal).toBe(490);
    expect(t.taxAmount).toBeCloseTo(24.5, 2);
    expect(t.total).toBeCloseTo(514.5, 2);
  });

  it("percent discount reduces taxable base", () => {
    const t = orders.cartTotals(lines, "percent", 10);
    expect(t.discount).toBeCloseTo(49, 2);
    expect(t.taxAmount).toBeCloseTo(22.05, 2);
    expect(t.total).toBeCloseTo(463.05, 2);
  });

  it("flat discount capped at subtotal", () => {
    const t = orders.cartTotals(lines, "flat", 9999);
    expect(t.discount).toBe(490);
    expect(t.total).toBe(0);
  });
});

function checkoutLatte(tableId?: string) {
  return orders.checkout({
    tableId,
    lines: [{ productId: "p-latte", qty: 2, note: "" }],
    discountType: "percent",
    discountValue: 0,
    payments: [{ method: "cash", amount: 378 }], // 360 + 5% = 378
  });
}

describe("checkout", () => {
  it("creates order, deducts stock, assigns invoice", () => {
    const milkBefore = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    const beansBefore = db().ingredients.find((i) => i.id === "i-beans")!.stock;
    const r = checkoutLatte("t-1");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.invoiceNo).toBe("INV-0001");
    expect(r.data.total).toBeCloseTo(378, 2);
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(milkBefore - 400);
    expect(db().ingredients.find((i) => i.id === "i-beans")!.stock).toBe(beansBefore - 36);
    expect(db().tables.find((t) => t.id === "t-1")!.status).toBe("occupied");
    // sale movements logged
    expect(db().movements.filter((m) => m.type === "sale").length).toBeGreaterThan(0);
  });

  it("increments invoice numbers", () => {
    checkoutLatte();
    const r2 = checkoutLatte();
    expect(r2.ok && r2.data.invoiceNo).toBe("INV-0002");
  });

  it("rejects wrong payment amount", () => {
    const r = orders.checkout({
      lines: [{ productId: "p-latte", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "cash", amount: 10 }],
    });
    expect(r.ok).toBe(false);
  });

  it("supports split payment", () => {
    const r = orders.checkout({
      lines: [{ productId: "p-latte", qty: 2, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "cash", amount: 200 }, { method: "upi", amount: 178 }],
    });
    expect(r.ok).toBe(true);
  });

  it("rejects unavailable product", () => {
    const r = orders.checkout({
      lines: [{ productId: "p-cheesecake", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "cash", amount: 273 }],
    });
    expect(r.ok).toBe(false);
  });

  it("rejects when stock insufficient", () => {
    db().ingredients.find((i) => i.id === "i-milk")!.stock = 100;
    const r = checkoutLatte(); // needs 400ml
    expect(r.ok).toBe(false);
  });

  it("applies variant price delta", () => {
    const r = orders.checkout({
      lines: [{ productId: "p-latte", variantId: "v-latte-l", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "upi", amount: 231 }], // (180+40)*1.05 = 231
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.items[0].name).toContain("Large");
  });
});

describe("order status machine", () => {
  it("walks pending→preparing→ready→served→completed and frees table", () => {
    const r = checkoutLatte("t-2");
    const id = r.ok ? r.data.id : "";
    expect(orders.transitionOrder(id, "preparing").ok).toBe(true);
    expect(orders.transitionOrder(id, "ready").ok).toBe(true);
    expect(orders.transitionOrder(id, "served").ok).toBe(true);
    expect(orders.transitionOrder(id, "completed").ok).toBe(true);
    expect(db().tables.find((t) => t.id === "t-2")!.status).toBe("cleaning");
    expect(db().tables.find((t) => t.id === "t-2")!.currentOrderId).toBeUndefined();
  });

  it("rejects illegal transition", () => {
    const r = checkoutLatte();
    const id = r.ok ? r.data.id : "";
    expect(orders.transitionOrder(id, "completed").ok).toBe(false); // pending→completed invalid
  });

  it("cancel restocks ingredients", () => {
    const milkBefore = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    const r = checkoutLatte("t-3");
    const id = r.ok ? r.data.id : "";
    const milkAfterSale = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    expect(milkAfterSale).toBe(milkBefore - 400);
    expect(orders.transitionOrder(id, "cancelled").ok).toBe(true);
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(milkBefore);
    expect(db().tables.find((t) => t.id === "t-3")!.status).toBe("available");
  });

  it("kitchen queue shows open orders oldest first", () => {
    checkoutLatte();
    checkoutLatte();
    const q = orders.kitchenQueue();
    expect(q).toHaveLength(2);
    expect(q[0].createdAt <= q[1].createdAt).toBe(true);
  });
});

describe("tables", () => {
  it("creates table, rejects duplicate name", () => {
    expect(orders.createTable({ name: "T9", seats: 4, zone: "Main" }).ok).toBe(true);
    expect(orders.createTable({ name: "T9", seats: 2, zone: "Main" }).ok).toBe(false);
  });

  it("transfer moves order between tables", () => {
    const r = checkoutLatte("t-1");
    expect(r.ok).toBe(true);
    const res = orders.transferOrder("t-1", "t-4");
    expect(res.ok).toBe(true);
    expect(db().tables.find((t) => t.id === "t-1")!.status).toBe("cleaning");
    expect(db().tables.find((t) => t.id === "t-4")!.status).toBe("occupied");
    expect(orders.getOrder(r.ok ? r.data.id : "")!.tableId).toBe("t-4");
  });

  it("transfer fails to occupied table", () => {
    checkoutLatte("t-1");
    checkoutLatte("t-2");
    expect(orders.transferOrder("t-1", "t-2").ok).toBe(false);
  });

  it("cannot delete occupied table", () => {
    checkoutLatte("t-1");
    expect(orders.deleteTable("t-1").ok).toBe(false);
  });

  it("cannot free table with open order", () => {
    checkoutLatte("t-1");
    expect(orders.setTableStatus("t-1", "available").ok).toBe(false);
  });
});
