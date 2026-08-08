import type { CafeTable, Customer, Employee, Order, Purchase, Settings, Supplier } from "@/lib/types";

export const seedTables: CafeTable[] = [
  { id: "t-1", name: "T1", seats: 2, zone: "Main", status: "available" },
  { id: "t-2", name: "T2", seats: 2, zone: "Main", status: "available" },
  { id: "t-3", name: "T3", seats: 4, zone: "Main", status: "available" },
  { id: "t-4", name: "T4", seats: 4, zone: "Main", status: "available" },
  { id: "t-5", name: "T5", seats: 6, zone: "Patio", status: "available" },
  { id: "t-6", name: "T6", seats: 6, zone: "Patio", status: "available" },
  { id: "t-7", name: "T7", seats: 2, zone: "Window", status: "available" },
  { id: "t-8", name: "T8", seats: 4, zone: "Window", status: "available" },
];

export const seedOrders: Order[] = [];

export const seedSuppliers: Supplier[] = [
  { id: "s-dairy", name: "Fresh Dairy Co", phone: "9876543210", gstin: "27ABCDE1234F1Z5", address: "Pune", ingredientIds: ["i-milk", "i-butter"] },
  { id: "s-coffee", name: "Bean Source", phone: "9876501234", gstin: "27FGHIJ5678K1Z2", address: "Chikmagalur", ingredientIds: ["i-beans"] },
  { id: "s-pack", name: "PackRight", phone: "9822011223", gstin: "", address: "Mumbai", ingredientIds: ["i-cup", "i-lid"] },
];

export const seedPurchases: Purchase[] = [];

export const seedCustomers: Customer[] = [
  { id: "c-1", name: "Aarav Shah", phone: "9812345678", preferences: "Oat milk latte", createdAt: new Date().toISOString() },
  { id: "c-2", name: "Meera Iyer", phone: "9898989898", preferences: "Less sugar", createdAt: new Date().toISOString() },
];

export const seedEmployees: Employee[] = [
  { id: "e-1", name: "Rohan Patel", email: "rohan@cafeos.in", phone: "9811111111", department: "Management", designation: "Owner", salary: 0, joiningDate: "2024-01-01", status: "active", role: "admin", imageUrl: "", permissions: [] },
  { id: "e-2", name: "Sana Khan", email: "sana@cafeos.in", phone: "9822222222", department: "Kitchen", designation: "Head Barista", salary: 32000, joiningDate: "2024-03-15", status: "active", role: "manager", imageUrl: "", permissions: [] },
  { id: "e-3", name: "Vikram Rao", email: "vikram@cafeos.in", phone: "9833333333", department: "Service", designation: "Cashier", salary: 22000, joiningDate: "2024-06-01", status: "active", role: "staff", imageUrl: "", permissions: [] },
];

export const seedSettings: Settings = {
  restaurantName: "CaféOS Demo Café",
  gstin: "27ABCDE1234F1Z5",
  address: "12 FC Road, Pune 411005",
  phone: "020-25501234",
  logoUrl: "",
  invoicePrefix: "INV-",
  defaultGstRate: 5,
  businessHours: {
    mon: { open: "08:00", close: "22:00" },
    tue: { open: "08:00", close: "22:00" },
    wed: { open: "08:00", close: "22:00" },
    thu: { open: "08:00", close: "22:00" },
    fri: { open: "08:00", close: "23:00" },
    sat: { open: "09:00", close: "23:00" },
    sun: { open: "09:00", close: "22:00" },
  },
  printerAutoKot: false,
  printerPaperWidth: "80mm",
};
