import { beforeEach, describe, expect, it } from "vitest";
import { resetDB, db } from "@/lib/data/store";
import * as pur from "@/lib/data/purchases";
import * as people from "@/lib/data/people";
import * as orders from "@/lib/data/orders";

beforeEach(() => resetDB());

describe("suppliers", () => {
  const input = { name: "New Supplier", phone: "9900011223", gstin: "", address: "", ingredientIds: [] };

  it("creates and blocks duplicate phone", () => {
    expect(pur.createSupplier(input).ok).toBe(true);
    expect(pur.createSupplier(input).ok).toBe(false);
  });

  it("blocks delete with purchase history", () => {
    pur.createPurchase({ supplierId: "s-dairy", invoiceNo: "PO-1", date: "2026-08-01", lines: [{ ingredientId: "i-milk", qty: 1000, unitCost: 0.06 }] });
    expect(pur.deleteSupplier("s-dairy").ok).toBe(false);
  });
});

describe("purchases", () => {
  const po = { supplierId: "s-dairy", invoiceNo: "PO-100", date: "2026-08-01", lines: [{ ingredientId: "i-milk", qty: 1000, unitCost: 0.06 }] };

  it("creates purchase, increases stock, computes total", () => {
    const before = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    const r = pur.createPurchase(po);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.total).toBe(60);
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(before + 1000);
  });

  it("rejects duplicate invoice no", () => {
    pur.createPurchase(po);
    expect(pur.createPurchase(po).ok).toBe(false);
  });

  it("delete reverses stock", () => {
    const before = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    const r = pur.createPurchase(po);
    const id = r.ok ? r.data.id : "";
    expect(pur.deletePurchase(id).ok).toBe(true);
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(before);
  });

  it("delete blocked when stock consumed", () => {
    db().ingredients.find((i) => i.id === "i-milk")!.stock = 0;
    const r = pur.createPurchase(po); // stock now 1000
    const id = r.ok ? r.data.id : "";
    orders.checkout({ // consumes 200ml via 1 latte
      lines: [{ productId: "p-latte", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "cash", amount: 189 }],
    });
    expect(pur.deletePurchase(id).ok).toBe(false);
  });

  it("supplier stats aggregates", () => {
    pur.createPurchase(po);
    const stats = pur.supplierStats("s-dairy");
    expect(stats.purchases).toHaveLength(1);
    expect(stats.totalSpent).toBe(60);
  });
});

describe("customers", () => {
  it("blocks duplicate phone", () => {
    const r = people.createCustomer({ name: "Dup", phone: "9812345678", preferences: "" });
    expect(r.ok).toBe(false);
  });

  it("computes visit count and spend", () => {
    orders.checkout({
      customerId: "c-1",
      lines: [{ productId: "p-espresso", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "upi", amount: 126 }],
    });
    const list = people.listCustomers({ search: "aarav" });
    expect(list.items[0].visitCount).toBe(1);
    expect(list.items[0].totalSpent).toBeCloseTo(126, 2);
  });
});

describe("employees", () => {
  const input = {
    name: "New Staff", email: "new@cafeos.in", phone: "9844444444", department: "Service",
    designation: "Runner", salary: 18000, joiningDate: "2026-01-01", status: "active" as const,
    role: "staff" as const, imageUrl: "", permissions: [] as never[],
  };

  it("creates and blocks duplicate email", () => {
    expect(people.createEmployee(input).ok).toBe(true);
    expect(people.createEmployee(input).ok).toBe(false);
  });

  it("cannot delete last admin", () => {
    expect(people.deleteEmployee("e-1").ok).toBe(false);
    expect(people.deleteEmployee("e-3").ok).toBe(true);
  });
});

describe("settings", () => {
  it("updates settings and invoice prefix applies", () => {
    const s = people.getSettings();
    people.updateSettings({ ...s, invoicePrefix: "CAF-" });
    const r = orders.checkout({
      lines: [{ productId: "p-espresso", qty: 1, note: "" }],
      discountType: "percent", discountValue: 0,
      payments: [{ method: "cash", amount: 126 }],
    });
    expect(r.ok && r.data.invoiceNo.startsWith("CAF-")).toBe(true);
  });
});
