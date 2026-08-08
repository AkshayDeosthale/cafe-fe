import { beforeEach, describe, expect, it } from "vitest";
import { resetDB } from "@/lib/data/store";
import * as orders from "@/lib/data/orders";
import * as reports from "@/lib/data/reports";
import * as people from "@/lib/data/people";
import { employeePermissions, hasPermission } from "@/lib/permissions";
import { elapsedBucket } from "@/lib/utils/format";

beforeEach(() => resetDB());

function seedTwoOrders() {
  orders.checkout({
    customerId: "c-1",
    lines: [{ productId: "p-latte", qty: 1, note: "" }, { productId: "p-muffin", qty: 2, note: "" }],
    discountType: "percent", discountValue: 0,
    payments: [{ method: "cash", amount: 462 }], // (180+260)*1.05
  });
  orders.checkout({
    lines: [{ productId: "p-espresso", qty: 1, note: "" }],
    discountType: "percent", discountValue: 0,
    payments: [{ method: "upi", amount: 126 }],
  });
}

describe("reports", () => {
  it("summary aggregates revenue/orders/avg/gst", () => {
    seedTwoOrders();
    const s = reports.reportSummary();
    expect(s.orders).toBe(2);
    expect(s.revenue).toBeCloseTo(588, 2);
    expect(s.avgOrderValue).toBeCloseTo(294, 2);
    expect(s.gstCollected).toBeCloseTo(28, 2);
  });

  it("sales by day groups correctly", () => {
    seedTwoOrders();
    const days = reports.salesByDay();
    expect(days).toHaveLength(1);
    expect(days[0].orders).toBe(2);
  });

  it("top products by qty", () => {
    seedTwoOrders();
    const top = reports.topProducts(5);
    expect(top[0].name).toContain("Muffin");
    expect(top[0].qty).toBe(2);
  });

  it("category split sums by category", () => {
    seedTwoOrders();
    const split = reports.categorySplit();
    expect(split.find((c) => c.name === "Coffee")!.value).toBeCloseTo(300, 2);
    expect(split.find((c) => c.name === "Bakery")!.value).toBeCloseTo(260, 2);
  });

  it("payment split", () => {
    seedTwoOrders();
    const split = reports.paymentSplit();
    expect(split.find((p) => p.name === "cash")!.value).toBeCloseTo(462, 2);
  });

  it("excludes cancelled orders", () => {
    seedTwoOrders();
    const all = orders.listOrders({});
    orders.transitionOrder(all.items[0].id, "cancelled");
    expect(reports.reportSummary().orders).toBe(1);
  });

  it("inventory usage tracks sale movements", () => {
    seedTwoOrders();
    const usage = reports.inventoryUsage();
    const milk = usage.find((u) => u.id === "i-milk")!;
    expect(milk.used).toBe(200); // 1 latte
  });

  it("CSV escaping", () => {
    const csv = reports.toCSV([{ a: "x,y", b: 'he said "hi"', c: 5 }]);
    expect(csv).toBe('a,b,c\n"x,y","he said ""hi""",5');
  });

  it("empty CSV", () => {
    expect(reports.toCSV([])).toBe("");
  });
});

describe("permissions", () => {
  it("admin has all", () => {
    const admin = people.listEmployees({}).items.find((e) => e.role === "admin")!;
    expect(hasPermission(admin, "crm.manage")).toBe(true);
    expect(hasPermission(admin, "settings.access")).toBe(true);
  });

  it("staff limited, custom permission extends", () => {
    const staff = people.listEmployees({}).items.find((e) => e.role === "staff")!;
    expect(hasPermission(staff, "reports.view")).toBe(false);
    const custom = { ...staff, permissions: ["reports.view" as const] };
    expect(hasPermission(custom, "reports.view")).toBe(true);
  });

  it("manager middle tier", () => {
    const mgr = people.listEmployees({}).items.find((e) => e.role === "manager")!;
    expect(hasPermission(mgr, "inventory.edit")).toBe(true);
    expect(hasPermission(mgr, "crm.manage")).toBe(false);
    expect(employeePermissions(mgr).length).toBeGreaterThan(0);
  });
});

describe("elapsed bucket", () => {
  it("green/amber/red thresholds", () => {
    const now = new Date("2026-08-08T12:00:00Z");
    expect(elapsedBucket("2026-08-08T11:55:00Z", now)).toBe("green");
    expect(elapsedBucket("2026-08-08T11:45:00Z", now)).toBe("amber");
    expect(elapsedBucket("2026-08-08T11:30:00Z", now)).toBe("red");
  });
});
