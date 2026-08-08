import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PosClient } from "@/features/pos/client";
import type { CafeTable, Category, Customer, Product } from "@/lib/types";

vi.mock("@/lib/actions/orders", () => ({
  placeOrder: vi.fn(async () => ({
    ok: true,
    data: { id: "o-1", invoiceNo: "INV-0001", total: 189 },
  })),
}));

const categories: (Category & { productCount: number })[] = [
  { id: "cat-coffee", name: "Coffee", description: "", sortOrder: 1, productCount: 2 },
  { id: "cat-bakery", name: "Bakery", description: "", sortOrder: 2, productCount: 1 },
];

const products: Product[] = [
  { id: "p-latte", name: "Cafe Latte", categoryId: "cat-coffee", price: 180, gstRate: 5, sku: "COF-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-espresso", name: "Espresso", categoryId: "cat-coffee", price: 120, gstRate: 5, sku: "COF-001", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
  { id: "p-muffin", name: "Blueberry Muffin", categoryId: "cat-bakery", price: 130, gstRate: 5, sku: "BAK-002", barcode: "", description: "", imageUrl: "", available: true, variants: [] },
];

const tables: CafeTable[] = [
  { id: "t-1", name: "T1", seats: 2, zone: "Main", status: "available" },
];
const customers: Customer[] = [];

function renderPos() {
  return render(<PosClient categories={categories} products={products} tables={tables} customers={customers} />);
}

describe("POS", () => {
  it("adds item and shows total with GST", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("button", { name: /add cafe latte/i }));
    // 180 * 1.05 = 189
    expect(screen.getByRole("button", { name: /charge/i })).toHaveTextContent("₹189.00");
  });

  it("qty bump updates total", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("button", { name: /add cafe latte/i }));
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("button", { name: /charge/i })).toHaveTextContent("₹378.00");
  });

  it("decrease to zero removes line", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("button", { name: /add cafe latte/i }));
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(screen.getByText(/cart empty/i)).toBeInTheDocument();
  });

  it("category tab filters grid", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("tab", { name: "Bakery" }));
    expect(screen.queryByRole("button", { name: /add cafe latte/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add blueberry muffin/i })).toBeInTheDocument();
  });

  it("clear empties cart", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("button", { name: /add cafe latte/i }));
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByText(/cart empty/i)).toBeInTheDocument();
  });

  it("payment dialog completes order and shows receipt", async () => {
    const user = userEvent.setup();
    renderPos();
    await user.click(screen.getByRole("button", { name: /add cafe latte/i }));
    await user.click(screen.getByRole("button", { name: /charge/i }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /confirm/i }));
    expect(await screen.findByText("INV-0001")).toBeInTheDocument();
    expect(screen.getByText(/cart empty/i)).toBeInTheDocument();
  });
});
