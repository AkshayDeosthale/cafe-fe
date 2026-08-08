"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/orders";
import type { CheckoutInput, OrderQuery } from "@/lib/data/orders";
import { checkoutSchema, tableSchema } from "@/lib/types";
import type { OrderStatus, TableInput, TableStatus } from "@/lib/types";

export async function placeOrder(input: CheckoutInput) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = repo.checkout(parsed.data);
  if (result.ok) {
    revalidatePath("/orders");
    revalidatePath("/kitchen");
    revalidatePath("/tables");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
  }
  return result;
}

export async function getOrders(q: OrderQuery) {
  return repo.listOrders(q);
}

export async function getOrder(id: string) {
  return repo.getOrder(id);
}

export async function setOrderStatus(id: string, next: OrderStatus) {
  const result = repo.transitionOrder(id, next);
  if (result.ok) {
    revalidatePath("/orders");
    revalidatePath("/kitchen");
    revalidatePath("/tables");
  }
  return result;
}

export async function getKitchenQueue() {
  return repo.kitchenQueue();
}

export async function getTables() {
  return repo.listTables();
}

export async function saveTable(input: TableInput) {
  const parsed = tableSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = repo.createTable(parsed.data);
  if (result.ok) revalidatePath("/tables");
  return result;
}

export async function setTableStatus(id: string, status: TableStatus) {
  const result = repo.setTableStatus(id, status);
  if (result.ok) revalidatePath("/tables");
  return result;
}

export async function removeTable(id: string) {
  const result = repo.deleteTable(id);
  if (result.ok) revalidatePath("/tables");
  return result;
}

export async function transferTableOrder(fromId: string, toId: string) {
  const result = repo.transferOrder(fromId, toId);
  if (result.ok) revalidatePath("/tables");
  return result;
}

export async function mergeTableInto(sourceId: string, targetId: string) {
  const result = repo.mergeTables(sourceId, targetId);
  if (result.ok) revalidatePath("/tables");
  return result;
}
