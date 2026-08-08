// ponytail: in-memory store on globalThis so Next dev HMR keeps state.
// Backend swap = replace repo internals, UI unchanged. Resets on server restart.
import { seedCategories, seedProducts } from "@/mock/catalog";
import { seedIngredients, seedMovements, seedRecipes } from "@/mock/inventory";
import {
  seedCustomers,
  seedEmployees,
  seedOrders,
  seedPurchases,
  seedSettings,
  seedSuppliers,
  seedTables,
} from "@/mock/operations";
import type {
  CafeTable,
  Category,
  Customer,
  Employee,
  Ingredient,
  Order,
  Paged,
  Product,
  Purchase,
  Query,
  Recipe,
  Settings,
  StockMovement,
  Supplier,
} from "@/lib/types";

export type DB = {
  categories: Category[];
  products: Product[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  movements: StockMovement[];
  tables: CafeTable[];
  orders: Order[];
  suppliers: Supplier[];
  purchases: Purchase[];
  customers: Customer[];
  employees: Employee[];
  settings: Settings;
  counters: { invoice: number };
};

function fresh(): DB {
  return {
    categories: structuredClone(seedCategories),
    products: structuredClone(seedProducts),
    ingredients: structuredClone(seedIngredients),
    recipes: structuredClone(seedRecipes),
    movements: structuredClone(seedMovements),
    tables: structuredClone(seedTables),
    orders: structuredClone(seedOrders),
    suppliers: structuredClone(seedSuppliers),
    purchases: structuredClone(seedPurchases),
    customers: structuredClone(seedCustomers),
    employees: structuredClone(seedEmployees),
    settings: structuredClone(seedSettings),
    counters: { invoice: 1 },
  };
}

const g = globalThis as unknown as { __cafeosDB?: DB };

export function db(): DB {
  g.__cafeosDB ??= fresh();
  return g.__cafeosDB;
}

/** Tests only: wipe back to seed data. */
export function resetDB(): void {
  g.__cafeosDB = fresh();
}

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

// ---------- shared query helpers ----------
export function matchesSearch(haystack: string[], search?: string): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return haystack.some((h) => h.toLowerCase().includes(q));
}

export function paginate<T>(items: T[], q: Query): Paged<T> {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.max(1, q.pageSize ?? 10);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}
