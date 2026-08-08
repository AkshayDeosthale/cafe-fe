import { db } from "@/lib/data/store";
import type { Employee, Permission } from "@/lib/types";
import { PERMISSIONS } from "@/lib/types";

export const ROLE_PERMISSIONS: Record<Employee["role"], Permission[]> = {
  admin: [...PERMISSIONS],
  manager: [
    "inventory.view",
    "inventory.edit",
    "reports.view",
    "products.edit",
    "billing.access",
    "pos.access",
    "settings.access",
  ],
  staff: ["pos.access", "billing.access"],
};

export function employeePermissions(employee: Employee): Permission[] {
  return [...new Set([...ROLE_PERMISSIONS[employee.role], ...employee.permissions])];
}

export function hasPermission(employee: Employee, permission: Permission): boolean {
  return employeePermissions(employee).includes(permission);
}

// ponytail: dev-mode "current user" = first admin. Swap with Clerk session later.
export function currentEmployee(): Employee {
  const d = db();
  return d.employees.find((e) => e.role === "admin") ?? d.employees[0];
}

export function can(permission: Permission): boolean {
  const me = currentEmployee();
  return me ? hasPermission(me, permission) : false;
}
