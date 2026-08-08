import { beforeEach, describe, expect, it } from "vitest";
import { resetDB, db } from "@/lib/data/store";
import * as inv from "@/lib/data/inventory";

beforeEach(() => resetDB());

describe("ingredients", () => {
  it("creates ingredient", () => {
    const r = inv.createIngredient({ name: "Vanilla", unit: "ml", stock: 100, reorderLevel: 10, unitCost: 1, category: "Syrups" });
    expect(r.ok).toBe(true);
    expect(inv.listIngredients({ search: "vanilla" }).total).toBe(1);
  });

  it("detects low stock", () => {
    const low = inv.lowStockIngredients().map((i) => i.name);
    expect(low).toContain("Chocolate Syrup"); // 400 <= 500
    expect(low).toContain("Cup Lid"); // 150 <= 200
    expect(low).not.toContain("Milk");
  });

  it("filters low stock in list", () => {
    const r = inv.listIngredients({ lowStockOnly: true });
    expect(r.items.every((i) => i.stock <= i.reorderLevel)).toBe(true);
  });

  it("blocks delete when used in recipe", () => {
    expect(inv.deleteIngredient("i-milk").ok).toBe(false);
    expect(inv.deleteIngredient("i-flour").ok).toBe(true); // flour unused in recipes
  });
});

describe("stock adjustments", () => {
  it("adds stock with movement record", () => {
    const before = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    const r = inv.adjustStock("i-milk", "manual", 500, "found crate");
    expect(r.ok).toBe(true);
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(before + 500);
    expect(inv.listMovements("i-milk")).toHaveLength(1);
  });

  it("waste is negative", () => {
    const before = db().ingredients.find((i) => i.id === "i-milk")!.stock;
    inv.adjustStock("i-milk", "waste", 200, "spoiled");
    expect(db().ingredients.find((i) => i.id === "i-milk")!.stock).toBe(before - 200);
  });

  it("refuses negative stock", () => {
    const r = inv.adjustStock("i-milk", "waste", 999999, "nope");
    expect(r.ok).toBe(false);
  });
});

describe("recipes", () => {
  it("computes recipe cost", () => {
    const latte = inv.getRecipeByProduct("p-latte")!;
    // 200ml milk @0.06 + 18g beans @1.2 + cup 3 + lid 1.5 = 12 + 21.6 + 3 + 1.5 = 38.1
    expect(inv.recipeCost(latte)).toBeCloseTo(38.1, 2);
  });

  it("upserts recipe lines", () => {
    const r = inv.upsertRecipe({ productId: "p-latte", lines: [{ ingredientId: "i-milk", qty: 100 }] });
    expect(r.ok).toBe(true);
    expect(inv.getRecipeByProduct("p-latte")!.lines).toHaveLength(1);
  });

  it("rejects unknown ingredient", () => {
    expect(inv.upsertRecipe({ productId: "p-latte", lines: [{ ingredientId: "nope", qty: 1 }] }).ok).toBe(false);
  });

  it("lists products missing recipes", () => {
    const missing = inv.productsMissingRecipes();
    expect(missing).toContain("p-croissant");
    expect(missing).not.toContain("p-latte");
  });
});
