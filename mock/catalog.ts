import type { Category, Product } from "@/lib/types";

export const seedCategories: Category[] = [
  { id: "cat-coffee", name: "Coffee", description: "Hot & cold coffee", sortOrder: 1 },
  { id: "cat-tea", name: "Tea", description: "Chai & infusions", sortOrder: 2 },
  { id: "cat-bakery", name: "Bakery", description: "Fresh bakes", sortOrder: 3 },
  { id: "cat-desserts", name: "Desserts", description: "Sweet endings", sortOrder: 4 },
  { id: "cat-food", name: "Food", description: "Sandwiches & meals", sortOrder: 5 },
  { id: "cat-cold", name: "Cold Drinks", description: "Shakes & coolers", sortOrder: 6 },
];

export const seedProducts: Product[] = [
  { id: "p-espresso", name: "Espresso", categoryId: "cat-coffee", price: 120, gstRate: 5, sku: "COF-001", barcode: "", description: "Double shot", imageUrl: "", available: true, variants: [] },
  { id: "p-latte", name: "Cafe Latte", categoryId: "cat-coffee", price: 180, gstRate: 5, sku: "COF-002", barcode: "", description: "Espresso + steamed milk", imageUrl: "", available: true, variants: [{ id: "v-latte-l", name: "Large", priceDelta: 40 }] },
  { id: "p-cappuccino", name: "Cappuccino", categoryId: "cat-coffee", price: 170, gstRate: 5, sku: "COF-003", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-coldcoffee", name: "Cold Coffee", categoryId: "cat-coffee", price: 200, gstRate: 5, sku: "COF-004", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-masala-chai", name: "Masala Chai", categoryId: "cat-tea", price: 80, gstRate: 5, sku: "TEA-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-green-tea", name: "Green Tea", categoryId: "cat-tea", price: 100, gstRate: 5, sku: "TEA-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-croissant", name: "Butter Croissant", categoryId: "cat-bakery", price: 140, gstRate: 5, sku: "BAK-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-muffin", name: "Blueberry Muffin", categoryId: "cat-bakery", price: 130, gstRate: 5, sku: "BAK-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-brownie", name: "Chocolate Brownie", categoryId: "cat-desserts", price: 160, gstRate: 5, sku: "DES-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-cheesecake", name: "Basque Cheesecake", categoryId: "cat-desserts", price: 260, gstRate: 5, sku: "DES-002", barcode: "", description: "", imageUrl: "", available: false, variants: [] },
  { id: "p-veg-sandwich", name: "Veg Grilled Sandwich", categoryId: "cat-food", price: 190, gstRate: 5, sku: "FOOD-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-pasta", name: "Alfredo Pasta", categoryId: "cat-food", price: 320, gstRate: 5, sku: "FOOD-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-oreo-shake", name: "Oreo Milkshake", categoryId: "cat-cold", price: 240, gstRate: 5, sku: "CLD-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-iced-tea", name: "Peach Iced Tea", categoryId: "cat-cold", price: 150, gstRate: 5, sku: "CLD-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
];
