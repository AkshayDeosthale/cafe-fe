"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/data/people";
import { customerSchema, employeeSchema, settingsSchema } from "@/lib/types";
import type { CustomerInput, EmployeeInput, Query, Settings } from "@/lib/types";

export async function getCustomers(q: Query) {
  return repo.listCustomers(q);
}

export async function saveCustomer(input: CustomerInput, id?: string) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateCustomer(id, parsed.data) : repo.createCustomer(parsed.data);
  if (result.ok) revalidatePath("/customers");
  return result;
}

export async function removeCustomer(id: string) {
  const result = repo.deleteCustomer(id);
  if (result.ok) revalidatePath("/customers");
  return result;
}

export async function getEmployees(q: Query & { department?: string; status?: string }) {
  return repo.listEmployees(q);
}

export async function saveEmployee(input: EmployeeInput, id?: string) {
  const parsed = employeeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const result = id ? repo.updateEmployee(id, parsed.data) : repo.createEmployee(parsed.data);
  if (result.ok) revalidatePath("/crm");
  return result;
}

export async function removeEmployee(id: string) {
  const result = repo.deleteEmployee(id);
  if (result.ok) revalidatePath("/crm");
  return result;
}

export async function getSettings() {
  return repo.getSettings();
}

export async function saveSettings(input: Settings) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  return repo.updateSettings(parsed.data);
}
