"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState } from "@/components/shared/misc";
import {
  adjustIngredientStock, getMovements, removeIngredient, saveIngredient,
} from "@/lib/actions/inventory";
import type { Ingredient, StockMovement } from "@/lib/types";
import { UNITS } from "@/lib/types";
import { formatTime, formatDate, inr } from "@/lib/utils/format";
import { HistoryIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

export function InventoryClient({ ingredients, lowOnly }: { ingredients: Ingredient[]; lowOnly: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [adjustFor, setAdjustFor] = useState<Ingredient | null>(null);
  const [historyFor, setHistoryFor] = useState<Ingredient | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      unit: String(fd.get("unit") ?? "pcs") as Ingredient["unit"],
      stock: Number(fd.get("stock") ?? 0),
      reorderLevel: Number(fd.get("reorderLevel") ?? 0),
      unitCost: Number(fd.get("unitCost") ?? 0),
      category: String(fd.get("category") ?? "General"),
    };
    startTransition(async () => {
      const r = await saveIngredient(input, editing?.id);
      if (r.ok) {
        setOpen(false);
        setEditing(null);
        toast.success("Ingredient saved");
      } else setError(r.error);
    });
  }

  function submitAdjust(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!adjustFor) return;
    const fd = new FormData(e.currentTarget);
    const type = String(fd.get("type")) as "manual" | "waste" | "correction";
    const qty = Number(fd.get("qty"));
    const reason = String(fd.get("reason") ?? "");
    startTransition(async () => {
      const r = await adjustIngredientStock(adjustFor.id, type, qty, reason);
      if (r.ok) {
        setAdjustFor(null);
        toast.success("Stock adjusted");
      } else toast.error(r.error);
    });
  }

  function openHistory(ing: Ingredient) {
    setHistoryFor(ing);
    startTransition(async () => setMovements(await getMovements(ing.id)));
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id="low"
            checked={lowOnly}
            onCheckedChange={(v) => {
              const next = new URLSearchParams(params.toString());
              if (v) next.set("low", "true");
              else next.delete("low");
              next.delete("page");
              router.replace(`?${next.toString()}`);
            }}
          />
          <Label htmlFor="low">Low stock only</Label>
        </div>
        <div className="ml-auto">
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setError(""); } }}>
            <DialogTrigger render={<Button />}>
              <PlusIcon className="size-4" /> Add Ingredient
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Ingredient</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" defaultValue={editing?.unit ?? "pcs"}>
                      <SelectTrigger id="unit"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" defaultValue={editing?.category ?? "General"} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="stock">Stock</Label>
                    <Input id="stock" name="stock" type="number" step="0.01" defaultValue={editing?.stock ?? 0} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="reorderLevel">Reorder at</Label>
                    <Input id="reorderLevel" name="reorderLevel" type="number" step="0.01" defaultValue={editing?.reorderLevel ?? 0} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="unitCost">Cost/unit ₹</Label>
                    <Input id="unitCost" name="unitCost" type="number" step="0.0001" defaultValue={editing?.unitCost ?? 0} />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter><Button type="submit">Save</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {ingredients.length === 0 ? (
        <EmptyState title="No ingredients" hint="Add ingredients to track stock." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder at</TableHead>
                <TableHead className="text-right">Cost/unit</TableHead>
                <TableHead className="w-44" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">
                    {i.name}
                    {i.stock <= i.reorderLevel && (
                      <Badge variant="destructive" className="ml-2">Low</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{i.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.stock.toLocaleString("en-IN")} {i.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.reorderLevel.toLocaleString("en-IN")} {i.unit}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(i.unitCost)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => setAdjustFor(i)}>Adjust</Button>
                      <Button variant="ghost" size="icon" aria-label={`History ${i.name}`} onClick={() => openHistory(i)}>
                        <HistoryIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${i.name}`}
                        onClick={() => { setEditing(i); setOpen(true); }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <ConfirmButton
                        title={`Delete ${i.name}?`}
                        description="Blocked if used in a recipe."
                        action={() => removeIngredient(i.id)}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label={`Delete ${i.name}`}>
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

      <Dialog open={!!adjustFor} onOpenChange={(o) => !o && setAdjustFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adjust stock — {adjustFor?.name}</DialogTitle></DialogHeader>
          <form onSubmit={submitAdjust} className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="manual">
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Add (manual)</SelectItem>
                    <SelectItem value="waste">Waste (out)</SelectItem>
                    <SelectItem value="correction">Correction (+/−)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="qty">Qty ({adjustFor?.unit})</Label>
                <Input id="qty" name="qty" type="number" step="0.01" required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" name="reason" placeholder="e.g. spilled, found crate" />
            </div>
            <DialogFooter><Button type="submit">Apply</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Movements — {historyFor?.name}</SheetTitle></SheetHeader>
          <div className="mt-4 flex flex-col gap-2 overflow-y-auto">
            {movements.length === 0 && <p className="text-sm text-muted-foreground">No movements yet.</p>}
            {movements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div>
                  <div className="font-medium capitalize">{m.type}</div>
                  <div className="text-muted-foreground">{m.reason}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(m.createdAt)} {formatTime(m.createdAt)}</div>
                </div>
                <div className={`tabular-nums font-medium ${m.qty >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {m.qty >= 0 ? "+" : ""}{m.qty.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
