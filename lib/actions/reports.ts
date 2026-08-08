"use server";

import * as repo from "@/lib/data/reports";

export async function getReportSummary(from?: string, to?: string) {
  return repo.reportSummary(from, to);
}

export async function getSalesByDay(from?: string, to?: string) {
  return repo.salesByDay(from, to);
}

export async function getTopProducts(limit?: number, from?: string, to?: string) {
  return repo.topProducts(limit, from, to);
}

export async function getCategorySplit(from?: string, to?: string) {
  return repo.categorySplit(from, to);
}

export async function getPaymentSplit(from?: string, to?: string) {
  return repo.paymentSplit(from, to);
}

export async function getInventoryUsage(from?: string, to?: string) {
  return repo.inventoryUsage(from, to);
}

export async function getCSV(rows: Record<string, string | number>[]) {
  return repo.toCSV(rows);
}

export async function getDashboardStats() {
  return repo.dashboardStats();
}
