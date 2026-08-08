"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { EmptyState } from "@/components/shared/misc";
import { removePurchase, savePurchase } from "@/lib/actions/purchases";
import type { Ingredient, Purchase, PurchaseLine, Supplier } from "@/lib/types";
import { formatDate, inr } from "@/lib/utils/format";
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react";

export function PurchasesClient({
  purchases,
  suppliers,
  ingredients,
  filters,
}: {
  purchases: Purchase[];
  suppliers: Supplier[];
  ingredients: Ingredient[];
  filters: { supplier?: string; from?: string; to?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<(PurchaseLine & { key: number })[]>([{ key: 1, ingredientId: "", qty: 1, unitCost: 0 }]);
  const [, startTransition] = useTransition();

  function setFilter(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`?${next.toString()}`);
  }

  const total = lines.reduce((s, l) => s + l.qty * l.unitCost, 0);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      supplierId: String(fd.get("supplierId") ?? ""),
      invoiceNo: String(fd.get("invoiceNo") ?? ""),
      date: String(fd.get("date") ?? ""),
      lines: lines.filter((l) => l.ingredientId).map(({ ingredientId, qty, unitCost }) => ({ ingredientId, qty, unitCost })),
    };
    startTransition(async () => {
      const r = await savePurchase(input);
      if (r.ok) {
        setOpen(false);
        setLines([{ key: 1, ingredientId: "", qty: 1, unitCost: 0 }]);
        toast.success("Purchase recorded — stock updated");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.supplier ?? "all"} onValueChange={(v) => setFilter("supplier", v === "all" ? undefined : String(v))}>
          <SelectTrigger className="w-44" aria-label="Filter supplier"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All suppliers</SelectItem>
            {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={filters.from ?? ""} aria-label="From date"
          onChange={(e) => setFilter("from", e.target.value || undefined)} />
        <Input type="date" className="w-40" value={filters.to ?? ""} aria-label="To date"
          onChange={(e) => setFilter("to", e.target.value || undefined)} />
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <PlusIcon className="size-4" /> New Purchase
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader><DialogTitle>New Purchase Entry</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="supplierId">Supplier</Label>
                    <Select name="supplierId">
                      <SelectTrigger id="supplierId"><SelectValue placeholder="Pick…" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="invoiceNo">Invoice No</Label>
                    <Input id="invoiceNo" name="invoiceNo" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Items</Label>
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => setLines([...lines, { key: Date.now(), ingredientId: "", qty: 1, unitCost: 0 }])}>
                      <PlusIcon className="size-3" /> Line
                    </Button>
                  </div>
                  {lines.map((l, i) => (
                    <div key={l.key} className="grid grid-cols-[1fr_90px_110px_36px] items-end gap-2">
                      <Select value={l.ingredientId} onValueChange={(v) => setLines(lines.map((x, j) => (j === i ? { ...x, ingredientId: String(v) } : x)))}>
                        <SelectTrigger aria-label="Ingredient"><SelectValue placeholder="Ingredient…" /></SelectTrigger>
                        <SelectContent>
                          {ingredients.map((ing) => (
                            <SelectItem key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input type="number" min="0.01" step="0.01" value={l.qty} aria-label="Qty"
                        onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} />
                      <Input type="number" min="0" step="0.0001" value={l.unitCost} aria-label="Unit cost" placeholder="₹/unit"
                        onChange={(e) => setLines(lines.map((x, j) => (j === i ? { ...x, unitCost: Number(e.target.value) } : x)))} />
                      <Button type="button" variant="ghost" size="icon" aria-label="Remove line"
                        onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                        <XIcon className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-right text-sm font-medium">Total: {inr(total)}</p>
                </div>

                <DialogFooter><Button type="submit">Save & Add Stock</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {purchases.length === 0 ? (
        <EmptyState title="No purchases" hint="Record a supplier invoice to add stock." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.invoiceNo}</TableCell>
                  <TableCell>{suppliers.find((s) => s.id === p.supplierId)?.name ?? "—"}</TableCell>
                  <TableCell>{formatDate(p.date)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.lines.length}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(p.total)}</TableCell>
                  <TableCell>
                    <ConfirmButton
                      title={`Delete ${p.invoiceNo}?`}
                      description="Reverses stock. Blocked if stock was already consumed."
                      action={() => removePurchase(p.id)}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Delete ${p.invoiceNo}`}>
                          <Trash2Icon className="size-4 text-destructive" />
                        </Button>
                      }
                    />
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
