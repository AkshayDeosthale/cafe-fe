import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KitchenClient } from "@/features/kitchen/client";
import { setOrderStatus } from "@/lib/actions/orders";
import type { CafeTable, Order } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/orders", () => ({
  setOrderStatus: vi.fn(async () => ({ ok: true, data: {} })),
}));

const tables: CafeTable[] = [{ id: "t-1", name: "T1", seats: 2, zone: "Main", status: "occupied" }];

const order: Order = {
  id: "o-1",
  invoiceNo: "INV-0001",
  tableId: "t-1",
  items: [{ productId: "p-latte", name: "Cafe Latte", price: 180, qty: 2, note: "less sugar" }],
  status: "pending",
  discountType: "percent",
  discountValue: 0,
  subtotal: 360,
  taxAmount: 18,
  total: 378,
  payments: [{ method: "cash", amount: 378 }],
  createdAt: new Date().toISOString(),
};

describe("Kitchen", () => {
  it("shows order card with items, notes and table", () => {
    render(<KitchenClient orders={[order]} tables={tables} />);
    expect(screen.getByText("INV-0001")).toBeInTheDocument();
    expect(screen.getByText("T1")).toBeInTheDocument();
    expect(screen.getByText(/less sugar/)).toBeInTheDocument();
  });

  it("start moves pending → preparing", async () => {
    const user = userEvent.setup();
    render(<KitchenClient orders={[order]} tables={tables} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(setOrderStatus).toHaveBeenCalledWith("o-1", "preparing");
  });

  it("recall moves preparing → pending", async () => {
    const user = userEvent.setup();
    render(<KitchenClient orders={[{ ...order, status: "preparing" }]} tables={tables} />);
    await user.click(screen.getByRole("button", { name: "Recall" }));
    expect(setOrderStatus).toHaveBeenCalledWith("o-1", "pending");
  });

  it("empty state when queue clear", () => {
    render(<KitchenClient orders={[]} tables={tables} />);
    expect(screen.getByText(/kitchen is clear/i)).toBeInTheDocument();
  });
});
