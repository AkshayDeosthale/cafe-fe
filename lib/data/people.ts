import { db, matchesSearch, paginate, uid } from "./store";
import type { Result } from "./catalog";
import type {
  Customer,
  CustomerInput,
  Employee,
  EmployeeInput,
  Paged,
  Query,
  Settings,
} from "@/lib/types";

// ---------- Customers ----------
export function listCustomers(q: Query = {}): Paged<Customer & { visitCount: number; totalSpent: number; lastVisit?: string }> {
  const d = db();
  const items = d.customers
    .filter((c) => matchesSearch([c.name, c.phone], q.search))
    .map((c) => {
      const orders = d.orders.filter((o) => o.customerId === c.id && o.status !== "cancelled");
      return {
        ...c,
        visitCount: orders.length,
        totalSpent: orders.reduce((s, o) => s + o.total, 0),
        lastVisit: orders.map((o) => o.createdAt).sort().at(-1),
      };
    });
  items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q);
}

export function createCustomer(input: CustomerInput): Result<Customer> {
  if (db().customers.some((c) => c.phone === input.phone))
    return { ok: false, error: "Phone already registered" };
  const customer: Customer = { ...input, id: uid("c"), createdAt: new Date().toISOString() };
  db().customers.push(customer);
  return { ok: true, data: customer };
}

export function updateCustomer(id: string, input: CustomerInput): Result<Customer> {
  const d = db();
  const customer = d.customers.find((c) => c.id === id);
  if (!customer) return { ok: false, error: "Customer not found" };
  if (d.customers.some((c) => c.id !== id && c.phone === input.phone))
    return { ok: false, error: "Phone already registered" };
  Object.assign(customer, input);
  return { ok: true, data: customer };
}

export function deleteCustomer(id: string): Result<null> {
  const d = db();
  d.customers = d.customers.filter((c) => c.id !== id);
  return { ok: true, data: null };
}

// ---------- Employees (CRM) ----------
export function listEmployees(q: Query & { department?: string; status?: string } = {}): Paged<Employee> {
  let items = db().employees.slice();
  if (q.department) items = items.filter((e) => e.department === q.department);
  if (q.status) items = items.filter((e) => e.status === q.status);
  items = items.filter((e) => matchesSearch([e.name, e.email, e.phone, e.designation], q.search));
  items.sort((a, b) => a.name.localeCompare(b.name));
  return paginate(items, q);
}

export function createEmployee(input: EmployeeInput): Result<Employee> {
  if (db().employees.some((e) => e.email === input.email))
    return { ok: false, error: "Email already registered" };
  const employee: Employee = { ...input, id: uid("e") };
  db().employees.push(employee);
  return { ok: true, data: employee };
}

export function updateEmployee(id: string, input: EmployeeInput): Result<Employee> {
  const d = db();
  const employee = d.employees.find((e) => e.id === id);
  if (!employee) return { ok: false, error: "Employee not found" };
  if (d.employees.some((e) => e.id !== id && e.email === input.email))
    return { ok: false, error: "Email already registered" };
  Object.assign(employee, input);
  return { ok: true, data: employee };
}

export function deleteEmployee(id: string): Result<null> {
  const d = db();
  const employee = d.employees.find((e) => e.id === id);
  if (!employee) return { ok: false, error: "Employee not found" };
  if (employee.role === "admin" && d.employees.filter((e) => e.role === "admin").length === 1)
    return { ok: false, error: "Cannot delete the last admin" };
  d.employees = d.employees.filter((e) => e.id !== id);
  return { ok: true, data: null };
}

// ---------- Settings ----------
export function getSettings(): Settings {
  return db().settings;
}

export function updateSettings(input: Settings): Result<Settings> {
  db().settings = input;
  return { ok: true, data: input };
}
