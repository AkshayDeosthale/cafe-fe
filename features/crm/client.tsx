"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState, StatusBadge } from "@/components/shared/misc";
import { removeEmployee, saveEmployee } from "@/lib/actions/people";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import type { Employee, Permission } from "@/lib/types";
import { PERMISSIONS } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { KeyRoundIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export function CrmClient({ employees, statusFilter }: { employees: Employee[]; statusFilter?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [permsFor, setPermsFor] = useState<Employee | null>(null);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function setStatusFilter(v: string | null) {
    if (!v) return;
    const next = new URLSearchParams(params.toString());
    if (v === "all") next.delete("status");
    else next.set("status", v);
    next.delete("page");
    router.replace(`?${next.toString()}`);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      department: String(fd.get("department") ?? ""),
      designation: String(fd.get("designation") ?? ""),
      salary: Number(fd.get("salary") ?? 0),
      joiningDate: String(fd.get("joiningDate") ?? ""),
      status: (fd.get("status") === "inactive" ? "inactive" : "active") as "active" | "inactive",
      role: String(fd.get("role") ?? "staff") as Employee["role"],
      imageUrl: String(fd.get("imageUrl") ?? ""),
      permissions: editing?.permissions ?? [],
    };
    startTransition(async () => {
      const r = await saveEmployee(input, editing?.id);
      if (r.ok) {
        setOpen(false);
        setEditing(null);
        toast.success("Employee saved");
      } else setError(r.error);
    });
  }

  function savePerms() {
    if (!permsFor) return;
    startTransition(async () => {
      const r = await saveEmployee({ ...permsFor, permissions: perms }, permsFor.id);
      if (r.ok) {
        setPermsFor(null);
        toast.success("Permissions updated");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter ?? "all"} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32" aria-label="Filter status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setError(""); } }}>
            <DialogTrigger render={<Button />}>
              <PlusIcon className="size-4" /> Add Employee
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Employee</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing?.name} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={editing?.email} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" defaultValue={editing?.phone} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="joiningDate">Joining date</Label>
                    <Input id="joiningDate" name="joiningDate" type="date" defaultValue={editing?.joiningDate ?? new Date().toISOString().slice(0, 10)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" defaultValue={editing?.department ?? "Service"} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" name="designation" defaultValue={editing?.designation ?? "Staff"} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="salary">Salary ₹/mo</Label>
                    <Input id="salary" name="salary" type="number" min="0" defaultValue={editing?.salary ?? 0} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue={editing?.role ?? "staff"}>
                      <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editing?.status ?? "active"}>
                      <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="imageUrl">Profile image URL</Label>
                  <Input id="imageUrl" name="imageUrl" defaultValue={editing?.imageUrl} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter><Button type="submit">Save</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {employees.length === 0 ? (
        <EmptyState title="No employees" hint="Add staff to manage roles and access." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback>{e.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.designation}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{e.role}</Badge></TableCell>
                  <TableCell>{e.department}</TableCell>
                  <TableCell className="tabular-nums">{e.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(e.joiningDate)}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Permissions for ${e.name}`}
                        onClick={() => { setPermsFor(e); setPerms(e.permissions); }}>
                        <KeyRoundIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${e.name}`}
                        onClick={() => { setEditing(e); setOpen(true); }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`Remove ${e.name}?`}
                        description="The last admin cannot be removed."
                        action={() => removeEmployee(e.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${e.name}`}>
                            <Trash2Icon className="size-4 text-destructive" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!permsFor} onOpenChange={(o) => !o && setPermsFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Permissions — {permsFor?.name}</DialogTitle></DialogHeader>
          {permsFor && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Role <Badge variant="outline" className="capitalize">{permsFor.role}</Badge> grants:{" "}
                {ROLE_PERMISSIONS[permsFor.role].join(", ") || "none"}
              </p>
              <p className="text-sm font-medium">Extra permissions:</p>
              <div className="grid grid-cols-2 gap-2">
                {PERMISSIONS.map((p) => {
                  const fromRole = ROLE_PERMISSIONS[permsFor.role].includes(p);
                  return (
                    <label key={p} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={fromRole || perms.includes(p)}
                        disabled={fromRole}
                        onCheckedChange={(v) =>
                          setPerms(v ? [...perms, p] : perms.filter((x) => x !== p))
                        }
                      />
                      <span className={fromRole ? "text-muted-foreground" : ""}>{p}</span>
                    </label>
                  );
                })}
              </div>
              <DialogFooter><Button onClick={savePerms}>Save Permissions</Button></DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
