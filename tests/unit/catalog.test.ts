import { beforeEach, describe, expect, it } from "vitest";
import { resetDB } from "@/lib/data/store";
import * as catalog from "@/lib/data/catalog";

beforeEach(() => resetDB());

describe("categories", () => {
  it("creates and lists with product count", () => {
    const r = catalog.createCategory({ name: "Smoothies", description: "", sortOrder: 7 });
    expect(r.ok).toBe(true);
    const cats = catalog.listCategories();
    expect(cats.find((c) => c.name === "Smoothies")?.productCount).toBe(0);
    expect(cats.find((c) => c.name === "Coffee")?.productCount).toBe(4);
  });

  it("rejects duplicate name", () => {
    const r = catalog.createCategory({ name: "coffee", description: "", sortOrder: 9 });
    expect(r.ok).toBe(false);
  });

  it("updates category", () => {
    const r = catalog.updateCategory("cat-tea", { name: "Teas", description: "x", sortOrder: 2 });
    expect(r.ok && r.data.name).toBe("Teas");
  });

  it("blocks delete when products exist", () => {
    expect(catalog.deleteCategory("cat-coffee").ok).toBe(false);
    expect(catalog.deleteCategory("cat-tea").ok).toBe(false);
  });

  it("deletes empty category", () => {
    catalog.createCategory({ name: "Empty", description: "", sortOrder: 99 });
    const cat = catalog.listCategories().find((c) => c.name === "Empty")!;
    expect(catalog.deleteCategory(cat.id).ok).toBe(true);
  });
});

describe("products", () => {
  const input = {
    name: "Test Drink", categoryId: "cat-coffee", price: 100, gstRate: 5,
    sku: "TST-1", barcode: "", description: "", imageUrl: "", available: true, variants: [],
  };

  it("creates product", () => {
    const r = catalog.createProduct(input);
    expect(r.ok).toBe(true);
  });

  it("rejects duplicate SKU", () => {
    catalog.createProduct(input);
    expect(catalog.createProduct(input).ok).toBe(false);
  });

  it("rejects unknown category", () => {
    expect(catalog.createProduct({ ...input, categoryId: "nope" }).ok).toBe(false);
  });

  it("searches by name and sku", () => {
    expect(catalog.listProducts({ search: "latte" }).total).toBe(1);
    expect(catalog.listProducts({ search: "COF-001" }).total).toBe(1);
    expect(catalog.listProducts({ search: "zzz" }).total).toBe(0);
  });

  it("filters by category and availability", () => {
    expect(catalog.listProducts({ categoryId: "cat-tea" }).total).toBe(2);
    expect(catalog.listProducts({ available: false }).total).toBe(1);
  });

  it("paginates", () => {
    const page1 = catalog.listProducts({ page: 1, pageSize: 5 });
    const page2 = catalog.listProducts({ page: 2, pageSize: 5 });
    expect(page1.items).toHaveLength(5);
    expect(page2.items.length).toBeGreaterThan(0);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
  });

  it("toggles availability", () => {
    const r = catalog.toggleProductAvailability("p-latte");
    expect(r.ok && r.data.available).toBe(false);
    expect(catalog.toggleProductAvailability("p-latte").ok).toBe(true);
  });

  it("deletes product and its recipe", () => {
    expect(catalog.deleteProduct("p-latte").ok).toBe(true);
    expect(catalog.getProduct("p-latte")).toBeUndefined();
  });
});
