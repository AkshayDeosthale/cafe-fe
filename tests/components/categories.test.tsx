import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriesClient } from "@/features/categories/client";
import { saveCategory } from "@/lib/actions/catalog";
import type { Category } from "@/lib/types";

vi.mock("@/lib/actions/catalog", () => ({
  saveCategory: vi.fn(async () => ({ ok: true, data: {} })),
  removeCategory: vi.fn(async () => ({ ok: true, data: null })),
}));

const categories: (Category & { productCount: number })[] = [
  { id: "cat-coffee", name: "Coffee", description: "Hot & cold", sortOrder: 1, productCount: 4 },
  { id: "cat-tea", name: "Tea", description: "", sortOrder: 2, productCount: 2 },
];

beforeEach(() => vi.clearAllMocks());

describe("Categories", () => {
  it("renders rows with product counts", () => {
    render(<CategoriesClient categories={categories} />);
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("empty state when none", () => {
    render(<CategoriesClient categories={[]} />);
    expect(screen.getByText(/no categories yet/i)).toBeInTheDocument();
  });

  it("creates category via dialog", async () => {
    const user = userEvent.setup();
    render(<CategoriesClient categories={categories} />);
    await user.click(screen.getByRole("button", { name: /add category/i }));
    await user.type(screen.getByLabelText("Name"), "Smoothies");
    await user.type(screen.getByLabelText("Sort order"), "7");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(saveCategory).toHaveBeenCalledWith(
      { name: "Smoothies", description: "", sortOrder: 7 },
      undefined
    );
  });

  it("edit prefills dialog", async () => {
    const user = userEvent.setup();
    render(<CategoriesClient categories={categories} />);
    await user.click(screen.getByRole("button", { name: "Edit Coffee" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Coffee");
  });

  it("shows server error on duplicate", async () => {
    vi.mocked(saveCategory).mockResolvedValueOnce({ ok: false, error: "Category name already exists" });
    const user = userEvent.setup();
    render(<CategoriesClient categories={categories} />);
    await user.click(screen.getByRole("button", { name: /add category/i }));
    await user.type(screen.getByLabelText("Name"), "Coffee");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Category name already exists")).toBeInTheDocument();
  });

  it("delete asks confirmation then calls action", async () => {
    const user = userEvent.setup();
    render(<CategoriesClient categories={categories} />);
    await user.click(screen.getByRole("button", { name: "Delete Tea" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("Delete Tea?");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    const { removeCategory } = await import("@/lib/actions/catalog");
    expect(removeCategory).toHaveBeenCalledWith("cat-tea");
  });
});
