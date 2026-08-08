"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState } from "@/components/shared/misc";
import { getSupplierStats, removeSupplier, saveSupplier } from "@/lib/actions/purchases";
import type { Ingredient, Purchase, Supplier } from "@/lib/types";
import { formatDate, inr } from "@/lib/utils/format";
import { EyeIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export function SuppliersClient({
  suppliers,
  ingredients,
}: {
  suppliers: Supplier[];
  ingredients: Ingredient[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);
  const [history, setHistory] = useState<{ purchases: Purchase[]; totalSpent: number } | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      gstin: String(fd.get("gstin") ?? ""),
      address: String(fd.get("address") ?? ""),
      ingredientIds: editing?.ingredientIds ?? [],
    };
    startTransition(async () => {
      const r = await saveSupplier(input, editing?.id);
      if (r.ok) {
        setOpen(false);
        setEditing(null);
        toast.success("Supplier saved");
      } else setError(r.error);
    });
  }

  function openHistory(s: Supplier) {
    setViewing(s);
    setHistory(null);
    startTransition(async () => setHistory(await getSupplierStats(s.id)));
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setError(""); } }}>
          <DialogTrigger render={<Button />}>
            <PlusIcon className="size-4" /> Add Supplier
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Supplier</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={editing?.phone} placeholder="10 digits" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input id="gstin" name="gstin" defaultValue={editing?.gstin} placeholder="optional" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={editing?.address} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {suppliers.length === 0 ? (
        <EmptyState title="No suppliers" hint="Add your first vendor." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Supplies</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="tabular-nums">{s.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{s.gstin || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.ingredientIds.map((id) => (
                        <Badge key={id} variant="outline">
                          {ingredients.find((i) => i.id === id)?.name ?? id}
                        </Badge>
                      ))}
                      {s.ingredientIds.length === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`View ${s.name}`} onClick={() => openHistory(s)}>
                        <EyeIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`}
                        onClick={() => { setEditing(s); setOpen(true); }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`Delete ${s.name}?`}
                        description="Blocked if the supplier has purchase history."
                        action={() => removeSupplier(s.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${s.name}`}>
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

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>{viewing?.name} — purchases</SheetTitle></SheetHeader>
          <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
            {!history && <p className="text-sm text-muted-foreground">Loading…</p>}
            {history && (
              <>
                <p className="text-sm">Total spent: <span className="font-semibold">{inr(history.totalSpent)}</span></p>
                {history.purchases.length === 0 && <p className="text-sm text-muted-foreground">No purchases yet.</p>}
                {history.purchases.map((p) => (
                  <div key={p.id} className="rounded-md border p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{p.invoiceNo}</span>
                      <span className="tabular-nums">{inr(p.total)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(p.date)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
