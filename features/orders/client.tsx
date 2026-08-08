"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState, StatusBadge } from "@/components/shared/misc";
import { setOrderStatus } from "@/lib/actions/orders";
import type { CafeTable, Order, OrderStatus } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/types";
import { formatDate, formatTime, inr } from "@/lib/utils/format";
import { EyeIcon, PrinterIcon } from "lucide-react";

const NEXT: Partial<Record<OrderStatus, { label: string; to: OrderStatus }>> = {
  pending: { label: "Start Preparing", to: "preparing" },
  preparing: { label: "Mark Ready", to: "ready" },
  ready: { label: "Mark Served", to: "served" },
  served: { label: "Complete & Bill", to: "completed" },
};

export function OrdersClient({
  orders,
  tables,
  filters,
}: {
  orders: Order[];
  tables: CafeTable[];
  filters: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [viewing, setViewing] = useState<Order | null>(null);
  const [, startTransition] = useTransition();

  function setFilter(key: string, value?: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`?${next.toString()}`);
  }

  function transition(id: string, to: OrderStatus) {
    startTransition(async () => {
      const r = await setOrderStatus(id, to);
      if (!r.ok) toast.error(r.error);
      else setViewing(null);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.status ?? "all"} onValueChange={(v) => setFilter("status", v === "all" ? undefined : String(v))}>
          <SelectTrigger className="w-36" aria-label="Filter status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.method ?? "all"} onValueChange={(v) => setFilter("method", v === "all" ? undefined : String(v))}>
          <SelectTrigger className="w-32" aria-label="Filter payment"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="card">Card</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" className="w-40" value={filters.from ?? ""} aria-label="From date"
          onChange={(e) => setFilter("from", e.target.value || undefined)} />
        <Input type="date" className="w-40" value={filters.to ?? ""} aria-label="To date"
          onChange={(e) => setFilter("to", e.target.value || undefined)} />
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders" hint="Orders from POS appear here." />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.invoiceNo}</TableCell>
                  <TableCell>{tables.find((t) => t.id === o.tableId)?.name ?? "Takeaway"}</TableCell>
                  <TableCell className="text-right tabular-nums">{o.items.reduce((s, i) => s + i.qty, 0)}</TableCell>
                  <TableCell className="text-right tabular-nums">{inr(o.total)}</TableCell>
                  <TableCell className="uppercase text-muted-foreground">
                    {o.payments.map((p) => p.method).join("+")}
                  </TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(o.createdAt)} {formatTime(o.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" aria-label={`View ${o.invoiceNo}`} onClick={() => setViewing(o)}>
                      <EyeIcon className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>{viewing?.invoiceNo}</SheetTitle></SheetHeader>
          {viewing && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <StatusBadge status={viewing.status} />
                <span className="text-muted-foreground">{formatDate(viewing.createdAt)} {formatTime(viewing.createdAt)}</span>
              </div>

              <div className="flex flex-col gap-2">
                {viewing.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between rounded-md border p-2 text-sm">
                    <div>
                      <div className="font-medium">{i.qty} × {i.name}</div>
                      {i.note && <div className="text-xs text-muted-foreground">“{i.note}”</div>}
                    </div>
                    <span className="tabular-nums">{inr(i.price * i.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t pt-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{inr(viewing.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount ({viewing.discountType === "percent" ? `${viewing.discountValue}%` : "flat"})</span>
                  <span className="tabular-nums">−{inr(viewing.subtotal + viewing.taxAmount - viewing.total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground"><span>GST</span><span className="tabular-nums">{inr(viewing.taxAmount)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span className="tabular-nums">{inr(viewing.total)}</span></div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Paid via</span>
                  <span className="uppercase">{viewing.payments.map((p) => `${p.method} ${inr(p.amount)}`).join(" + ")}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {NEXT[viewing.status] && (
                  <Button onClick={() => transition(viewing.id, NEXT[viewing.status]!.to)}>
                    {NEXT[viewing.status]!.label}
                  </Button>
                )}
                {!["completed", "cancelled"].includes(viewing.status) && (
                  <ConfirmButton
                    title={`Cancel ${viewing.invoiceNo}?`}
                    description="Restocks ingredients per recipes."
                    action={() => setOrderStatus(viewing.id, "cancelled")}
                    onDone={() => setViewing(null)}
                    trigger={<Button variant="destructive">Cancel Order</Button>}
                  />
                )}
                <Button variant="outline" onClick={() => window.print()}>
                  <PrinterIcon className="size-4" /> Print Receipt
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
