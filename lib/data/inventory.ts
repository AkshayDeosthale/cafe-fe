import { db, matchesSearch, paginate, uid } from "./store";
import type { Result } from "./catalog";
import type {
  Ingredient,
  IngredientInput,
  MovementType,
  Paged,
  Query,
  Recipe,
  RecipeInput,
  StockMovement,
} from "@/lib/types";

// ---------- Ingredients ----------
export type IngredientQuery = Query & { lowStockOnly?: boolean };

export function listIngredients(q: IngredientQuery = {}): Paged<Ingredient> {
  let items = db().ingredients.slice();
  if (q.lowStockOnly) items = items.filter((i) => i.stock <= i.reorderLevel);
  items = items.filter((i) => matchesSearch([i.name, i.category], q.search));
  items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q);
}

export function lowStockIngredients(): Ingredient[] {
  return db().ingredients.filter((i) => i.stock <= i.reorderLevel);
}

export function createIngredient(input: IngredientInput): Result<Ingredient> {
  const ing: Ingredient = { ...input, id: uid("i") };
  db().ingredients.push(ing);
  return { ok: true, data: ing };
}

export function updateIngredient(id: string, input: IngredientInput): Result<Ingredient> {
  const ing = db().ingredients.find((i) => i.id === id);
  if (!ing) return { ok: false, error: "Ingredient not found" };
  Object.assign(ing, input);
  return { ok: true, data: ing };
}

export function deleteIngredient(id: string): Result<null> {
  const d = db();
  if (d.recipes.some((r) => r.lines.some((l) => l.ingredientId === id)))
    return { ok: false, error: "Ingredient is used in a recipe" };
  d.ingredients = d.ingredients.filter((i) => i.id !== id);
  return { ok: true, data: null };
}

// ---------- Stock adjustments ----------
export function adjustStock(
  ingredientId: string,
  type: Exclude<MovementType, "sale" | "purchase">,
  qty: number,
  reason: string
): Result<StockMovement> {
  const ing = db().ingredients.find((i) => i.id === ingredientId);
  if (!ing) return { ok: false, error: "Ingredient not found" };
  const signed = type === "waste" ? -Math.abs(qty) : qty;
  if (ing.stock + signed < 0) return { ok: false, error: "Stock cannot go negative" };
  ing.stock += signed;
  const movement: StockMovement = {
    id: uid("mv"),
    ingredientId,
    type,
    qty: signed,
    reason,
    createdAt: new Date().toISOString(),
  };
  db().movements.push(movement);
  return { ok: true, data: movement };
}

export function listMovements(ingredientId: string): StockMovement[] {
  return db()
    .movements.filter((m) => m.ingredientId === ingredientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Internal: apply stock delta with ref (used by purchases & checkout). */
export function applyMovement(
  ingredientId: string,
  type: MovementType,
  signedQty: number,
  reason: string,
  refId: string
): Result<null> {
  const ing = db().ingredients.find((i) => i.id === ingredientId);
  if (!ing) return { ok: false, error: `Ingredient ${ingredientId} not found` };
  if (ing.stock + signedQty < 0)
    return { ok: false, error: `Insufficient stock for ${ing.name}` };
  ing.stock += signedQty;
  db().movements.push({
    id: uid("mv"),
    ingredientId,
    type,
    qty: signedQty,
    reason,
    refId,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, data: null };
}

// ---------- Recipes ----------
export function listRecipes(): Recipe[] {
  return db().recipes;
}

export function getRecipeByProduct(productId: string): Recipe | undefined {
  return db().recipes.find((r) => r.productId === productId);
}

export function recipeCost(recipe: Recipe): number {
  const d = db();
  return recipe.lines.reduce((sum, line) => {
    const ing = d.ingredients.find((i) => i.id === line.ingredientId);
    return sum + (ing ? ing.unitCost * line.qty : 0);
  }, 0);
}

export function upsertRecipe(input: RecipeInput): Result<Recipe> {
  const d = db();
  for (const line of input.lines) {
    if (!d.ingredients.some((i) => i.id === line.ingredientId))
      return { ok: false, error: "Ingredient not found" };
  }
  let recipe = d.recipes.find((r) => r.productId === input.productId);
  if (recipe) {
    recipe.lines = input.lines;
  } else {
    recipe = { ...input, id: uid("r") };
    d.recipes.push(recipe);
  }
  return { ok: true, data: recipe };
}

export function productsMissingRecipes(): string[] {
  const d = db();
  return d.products.filter((p) => !d.recipes.some((r) => r.productId === p.id)).map((p) => p.id);
}
