"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { StatusBadge } from "@/components/shared/misc";
import {
  mergeTableInto, removeTable, saveTable, setTableStatus, transferTableOrder,
} from "@/lib/actions/orders";
import type { CafeTable } from "@/lib/types";
import { PlusIcon, UsersIcon } from "lucide-react";

const BORDER: Record<string, string> = {
  available: "border-green-500/50",
  occupied: "border-primary",
  reserved: "border-amber-500/60",
  cleaning: "border-muted-foreground/40",
};

export function TablesClient({ tables }: { tables: CafeTable[] }) {
  const [selected, setSelected] = useState<CafeTable | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [moveMode, setMoveMode] = useState<"transfer" | "merge" | null>(null);
  const [target, setTarget] = useState("");
  const [, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input = {
      name: String(fd.get("name") ?? ""),
      seats: Number(fd.get("seats") ?? 2),
      zone: String(fd.get("zone") ?? "Main"),
    };
    startTransition(async () => {
      const r = await saveTable(input);
      if (r.ok) {
        setAddOpen(false);
        toast.success("Table added");
      } else toast.error(r.error);
    });
  }

  function status(id: string, s: CafeTable["status"]) {
    startTransition(async () => {
      const r = await setTableStatus(id, s);
      if (!r.ok) toast.error(r.error);
      else setSelected(null);
    });
  }

  function move() {
    if (!selected || !target) return;
    startTransition(async () => {
      const r =
        moveMode === "transfer"
          ? await transferTableOrder(selected.id, target)
          : await mergeTableInto(selected.id, target);
      if (r.ok) {
        toast.success(moveMode === "transfer" ? "Order transferred" : "Tables merged");
        setSelected(null);
        setMoveMode(null);
        setTarget("");
      } else toast.error(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button />}>
            <PlusIcon className="size-4" /> Add Table
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Table</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="grid gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="T9" required />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="seats">Seats</Label>
                  <Input id="seats" name="seats" type="number" min="1" defaultValue={2} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" name="zone" defaultValue="Main" />
                </div>
              </div>
              <DialogFooter><Button type="submit">Save</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {tables.map((t) => (
          <Card
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => { setSelected(t); setMoveMode(null); setTarget(""); }}
            onKeyDown={(e) => e.key === "Enter" && setSelected(t)}
            className={`cursor-pointer border-2 transition-shadow hover:shadow-md ${BORDER[t.status]}`}
          >
            <CardContent className="flex flex-col items-center gap-1 p-4 text-center">
              <span className="text-lg font-semibold">{t.name}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <UsersIcon className="size-3" /> {t.seats} · {t.zone}
              </span>
              <StatusBadge status={t.status} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>{selected?.name}</SheetTitle></SheetHeader>
          {selected && (
            <div className="mt-4 flex flex-col gap-2">
              <StatusBadge status={selected.status} />

              {selected.status === "available" && (
                <Button nativeButton={false} render={<Link href={`/pos?table=${selected.id}`} />}>Seat & Take Order</Button>
              )}
              {selected.currentOrderId && (
                <Button nativeButton={false} render={<Link href="/orders" />} variant="outline">View Order</Button>
              )}

              {selected.status !== "occupied" && (
                <Button variant="outline" onClick={() => status(selected.id, "reserved")} disabled={selected.status === "reserved"}>
                  Reserve
                </Button>
              )}
              {selected.status === "cleaning" && (
                <Button variant="outline" onClick={() => status(selected.id, "available")}>Mark Clean & Free</Button>
              )}
              {selected.status === "reserved" && (
                <Button variant="outline" onClick={() => status(selected.id, "available")}>Cancel Reservation</Button>
              )}
              {selected.currentOrderId && (
                <>
                  <Button variant="outline" onClick={() => setMoveMode("transfer")}>Transfer Order</Button>
                  <Button variant="outline" onClick={() => setMoveMode("merge")}>Merge Into Another Table</Button>
                </>
              )}

              {moveMode && (
                <div className="mt-2 flex flex-col gap-2 rounded-md border p-3">
                  <Label>{moveMode === "transfer" ? "Transfer to" : "Merge into"}</Label>
                  <Select value={target} onValueChange={(v) => setTarget(String(v))}>
                    <SelectTrigger><SelectValue placeholder="Pick table…" /></SelectTrigger>
                    <SelectContent>
                      {tables
                        .filter((t) => t.id !== selected.id)
                        .filter((t) => (moveMode === "transfer" ? t.status === "available" : !t.currentOrderId))
                        .map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={move} disabled={!target}>Confirm</Button>
                </div>
              )}

              {!selected.currentOrderId && (
                <ConfirmButton
                  title={`Remove ${selected.name}?`}
                  description="Deletes the table from the floor."
                  action={() => removeTable(selected.id)}
                  onDone={() => setSelected(null)}
                  trigger={<Button variant="destructive">Remove Table</Button>}
                />
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
