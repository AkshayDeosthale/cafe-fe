"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState } from "@/components/shared/misc";
import { removeCustomer, saveCustomer } from "@/lib/actions/people";
import type { Customer } from "@/lib/types";
import { formatDate, inr } from "@/lib/utils/format";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

type Row = Customer & { visitCount: number; totalSpent: number; lastVisit?: string };

export function CustomersClient({ customers }: { customers: Row[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      preferences: String(fd.get("preferences") ?? ""),
    };
    startTransition(async () => {
      const r = await saveCustomer(input, editing?.id);
      if (r.ok) {
        setOpen(false);
        setEditing(null);
        toast.success("Customer saved");
      } else setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setError(""); } }}>
          <DialogTrigger render={<Button />}>
            <PlusIcon className="size-4" /> Add Customer
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Customer</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={editing?.phone} placeholder="10 digits" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="preferences">Preferences</Label>
                <Input id="preferences" name="preferences" defaultValue={editing?.preferences} placeholder="oat milk, less sugar…" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="No customers" hint="Attach customers at POS to build history." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Preferences</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="tabular-nums">{c.phone}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.visitCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(c.totalSpent)}</TableCell>
                  <TableCell className="text-muted-foreground">{c.preferences || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.lastVisit ? formatDate(c.lastVisit) : "—"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`}
                        onClick={() => { setEditing(c); setOpen(true); }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`Delete ${c.name}?`}
                        description="Order history is kept; the customer record is removed."
                        action={() => removeCustomer(c.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`}>
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
    </div>
  );
}
