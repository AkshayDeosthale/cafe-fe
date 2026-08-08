import type { Ingredient, Recipe, StockMovement } from "@/lib/types";

export const seedIngredients: Ingredient[] = [
  { id: "i-milk", name: "Milk", unit: "ml", stock: 12000, reorderLevel: 5000, unitCost: 0.06, category: "Dairy" },
  { id: "i-beans", name: "Coffee Beans", unit: "g", stock: 3500, reorderLevel: 1000, unitCost: 1.2, category: "Coffee" },
  { id: "i-sugar", name: "Sugar", unit: "g", stock: 8000, reorderLevel: 2000, unitCost: 0.05, category: "Dry" },
  { id: "i-choc", name: "Chocolate Syrup", unit: "ml", stock: 400, reorderLevel: 500, unitCost: 0.8, category: "Dry" },
  { id: "i-cup", name: "Paper Cup 250ml", unit: "pcs", stock: 320, reorderLevel: 200, unitCost: 3, category: "Packaging" },
  { id: "i-lid", name: "Cup Lid", unit: "pcs", stock: 150, reorderLevel: 200, unitCost: 1.5, category: "Packaging" },
  { id: "i-tea", name: "Tea Leaves", unit: "g", stock: 2000, reorderLevel: 500, unitCost: 0.4, category: "Tea" },
  { id: "i-flour", name: "Flour", unit: "g", stock: 9000, reorderLevel: 3000, unitCost: 0.04, category: "Bakery" },
  { id: "i-butter", name: "Butter", unit: "g", stock: 2500, reorderLevel: 1000, unitCost: 0.5, category: "Dairy" },
  { id: "i-oreo", name: "Oreo Biscuits", unit: "pcs", stock: 60, reorderLevel: 40, unitCost: 5, category: "Dry" },
];

export const seedRecipes: Recipe[] = [
  { id: "r-latte", productId: "p-latte", lines: [
    { ingredientId: "i-milk", qty: 200 },
    { ingredientId: "i-beans", qty: 18 },
    { ingredientId: "i-cup", qty: 1 },
    { ingredientId: "i-lid", qty: 1 },
  ]},
  { id: "r-espresso", productId: "p-espresso", lines: [
    { ingredientId: "i-beans", qty: 18 },
    { ingredientId: "i-cup", qty: 1 },
  ]},
  { id: "r-cappuccino", productId: "p-cappuccino", lines: [
    { ingredientId: "i-milk", qty: 150 },
    { ingredientId: "i-beans", qty: 18 },
    { ingredientId: "i-cup", qty: 1 },
    { ingredientId: "i-lid", qty: 1 },
  ]},
  { id: "r-coldcoffee", productId: "p-coldcoffee", lines: [
    { ingredientId: "i-milk", qty: 250 },
    { ingredientId: "i-beans", qty: 18 },
    { ingredientId: "i-choc", qty: 30 },
    { ingredientId: "i-cup", qty: 1 },
    { ingredientId: "i-lid", qty: 1 },
  ]},
  { id: "r-masala-chai", productId: "p-masala-chai", lines: [
    { ingredientId: "i-milk", qty: 150 },
    { ingredientId: "i-tea", qty: 8 },
    { ingredientId: "i-sugar", qty: 15 },
  ]},
  { id: "r-oreo-shake", productId: "p-oreo-shake", lines: [
    { ingredientId: "i-milk", qty: 300 },
    { ingredientId: "i-oreo", qty: 4 },
    { ingredientId: "i-choc", qty: 20 },
  ]},
];

export const seedMovements: StockMovement[] = [];
