import { z } from "zod";

// ---------- Catalog ----------
export const categorySchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().default(""),
  sortOrder: z.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;
export type Category = CategoryInput & { id: string };

export const variantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  priceDelta: z.number().default(0),
});
export type Variant = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  categoryId: z.string().min(1, "Category required"),
  price: z.number().nonnegative("Price must be ≥ 0"),
  gstRate: z.number().min(0).max(28).default(5),
  sku: z.string().default(""),
  barcode: z.string().default(""),
  description: z.string().default(""),
  imageUrl: z.string().default(""),
  available: z.boolean().default(true),
  variants: z.array(variantSchema).default([]),
});
export type ProductInput = z.infer<typeof productSchema>;
export type Product = ProductInput & { id: string };

// ---------- Inventory ----------
export const UNITS = ["g", "kg", "ml", "l", "pcs"] as const;
export type Unit = (typeof UNITS)[number];

export const ingredientSchema = z.object({
  name: z.string().min(1, "Name required"),
  unit: z.enum(UNITS),
  stock: z.number().default(0),
  reorderLevel: z.number().nonnegative().default(0),
  unitCost: z.number().nonnegative().default(0),
  category: z.string().default("General"),
});
export type IngredientInput = z.infer<typeof ingredientSchema>;
export type Ingredient = IngredientInput & { id: string };

export type MovementType = "purchase" | "sale" | "waste" | "manual" | "correction";
export type StockMovement = {
  id: string;
  ingredientId: string;
  type: MovementType;
  qty: number; // signed: + in, - out
  reason: string;
  refId?: string;
  createdAt: string;
};

export const recipeLineSchema = z.object({
  ingredientId: z.string().min(1),
  qty: z.number().positive("Qty must be > 0"),
});
export const recipeSchema = z.object({
  productId: z.string().min(1, "Product required"),
  lines: z.array(recipeLineSchema).min(1, "Add at least one ingredient"),
});
export type RecipeLine = z.infer<typeof recipeLineSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
export type Recipe = RecipeInput & { id: string };

// ---------- Suppliers & Purchases ----------
export const supplierSchema = z.object({
  name: z.string().min(1, "Name required"),
  phone: z.string().regex(/^\d{10}$/, "10-digit phone required"),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN")
    .or(z.literal("")),
  address: z.string().default(""),
  ingredientIds: z.array(z.string()).default([]),
});
export type SupplierInput = z.infer<typeof supplierSchema>;
export type Supplier = SupplierInput & { id: string };

export const purchaseLineSchema = z.object({
  ingredientId: z.string().min(1),
  qty: z.number().positive(),
  unitCost: z.number().nonnegative(),
});
export const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier required"),
  invoiceNo: z.string().min(1, "Invoice no required"),
  date: z.string().min(1),
  lines: z.array(purchaseLineSchema).min(1, "Add at least one item"),
});
export type PurchaseLine = z.infer<typeof purchaseLineSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type Purchase = PurchaseInput & { id: string; total: number; createdAt: string };

// ---------- Tables & Orders ----------
export const TABLE_STATUSES = ["available", "occupied", "reserved", "cleaning"] as const;
export type TableStatus = (typeof TABLE_STATUSES)[number];
export const tableSchema = z.object({
  name: z.string().min(1, "Name required"),
  seats: z.number().int().positive(),
  zone: z.string().default("Main"),
});
export type TableInput = z.infer<typeof tableSchema>;
export type CafeTable = TableInput & {
  id: string;
  status: TableStatus;
  currentOrderId?: string;
};

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderItem = {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  qty: number;
  note: string;
};

export const PAYMENT_METHODS = ["cash", "upi", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type Payment = { method: PaymentMethod; amount: number };

export type Order = {
  id: string;
  invoiceNo: string;
  tableId?: string;
  customerId?: string;
  items: OrderItem[];
  status: OrderStatus;
  discountType: "percent" | "flat";
  discountValue: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  payments: Payment[];
  createdAt: string;
};

export type CartLine = {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  qty: number;
  note: string;
  gstRate: number;
};

export const checkoutSchema = z.object({
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  lines: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      qty: z.number().int().positive(),
      note: z.string().default(""),
    })
  ).min(1, "Cart is empty"),
  discountType: z.enum(["percent", "flat"]).default("percent"),
  discountValue: z.number().nonnegative().default(0),
  payments: z
    .array(z.object({ method: z.enum(PAYMENT_METHODS), amount: z.number().positive() }))
    .min(1, "Payment required"),
});

// ---------- Customers ----------
export const customerSchema = z.object({
  name: z.string().min(1, "Name required"),
  phone: z.string().regex(/^\d{10}$/, "10-digit phone required"),
  preferences: z.string().default(""),
});
export type CustomerInput = z.infer<typeof customerSchema>;
export type Customer = CustomerInput & { id: string; createdAt: string };

// ---------- CRM / Employees ----------
export const PERMISSIONS = [
  "inventory.view",
  "inventory.edit",
  "reports.view",
  "products.edit",
  "billing.access",
  "pos.access",
  "crm.manage",
  "users.manage",
  "permissions.manage",
  "settings.access",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const employeeSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(/^\d{10}$/, "10-digit phone required"),
  department: z.string().default("Operations"),
  designation: z.string().default("Staff"),
  salary: z.number().nonnegative().default(0),
  joiningDate: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  role: z.enum(["admin", "manager", "staff"]).default("staff"),
  imageUrl: z.string().default(""),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
});
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type Employee = EmployeeInput & { id: string };

// ---------- Settings ----------
export const settingsSchema = z.object({
  restaurantName: z.string().min(1),
  gstin: z.string().default(""),
  address: z.string().default(""),
  phone: z.string().default(""),
  logoUrl: z.string().default(""),
  invoicePrefix: z.string().default("INV-"),
  defaultGstRate: z.number().min(0).max(28).default(5),
  businessHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() })).default({}),
  printerAutoKot: z.boolean().default(false),
  printerPaperWidth: z.enum(["58mm", "80mm"]).default("80mm"),
});
export type Settings = z.infer<typeof settingsSchema>;

// ---------- Common ----------
export type Query = {
  search?: string;
  page?: number;
  pageSize?: number;
};
export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };
