"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/inventory";
import type { IngredientQuery } from "@/lib/data/inventory";
import { ingredientSchema, recipeSchema } from "@/lib/types";
import type { IngredientInput, MovementType, RecipeInput } from "@/lib/types";

export async function getIngredients(q: IngredientQuery) {
  return repo.listIngredients(q);
}

export async function getLowStock() {
  return repo.lowStockIngredients();
}

export async function saveIngredient(input: IngredientInput, id?: string) {
  const parsed = ingredientSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateIngredient(id, parsed.data) : repo.createIngredient(parsed.data);
  if (result.ok) revalidatePath("/inventory");
  return result;
}

export async function removeIngredient(id: string) {
  const result = repo.deleteIngredient(id);
  if (result.ok) revalidatePath("/inventory");
  return result;
}

export async function adjustIngredientStock(
  ingredientId: string,
  type: Exclude<MovementType, "sale" | "purchase">,
  qty: number,
  reason: string
) {
  if (!Number.isFinite(qty) || qty === 0) return { ok: false as const, error: "Qty must be non-zero" };
  const result = repo.adjustStock(ingredientId, type, qty, reason);
  if (result.ok) revalidatePath("/inventory");
  return result;
}

export async function getMovements(ingredientId: string) {
  return repo.listMovements(ingredientId);
}

export async function getRecipes() {
  return repo.listRecipes();
}

export async function getRecipeForProduct(productId: string) {
  return repo.getRecipeByProduct(productId);
}

export async function saveRecipe(input: RecipeInput) {
  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = repo.upsertRecipe(parsed.data);
  if (result.ok) revalidatePath("/recipes");
  return result;
}

export async function getRecipeCost(recipeId: string) {
  const r = repo.listRecipes().find((x) => x.id === recipeId);
  return r ? repo.recipeCost(r) : 0;
}

export async function getProductsMissingRecipes() {
  return repo.productsMissingRecipes();
}
