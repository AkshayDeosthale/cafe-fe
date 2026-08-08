"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { placeOrder } from "@/lib/actions/orders";
import type { CafeTable, CartLine, Category, Customer, Payment, PaymentMethod, Product } from "@/lib/types";
import { cartTotals } from "@/lib/utils/totals";
import { inr } from "@/lib/utils/format";
import { MinusIcon, PlusIcon, ReceiptIcon, Trash2Icon } from "lucide-react";

export function PosClient({
  categories,
  products,
  tables,
  customers,
  initialTableId,
}: {
  categories: (Category & { productCount: number })[];
  products: Product[];
  tables: CafeTable[];
  customers: Customer[];
  initialTableId?: string;
}) {
  const [cat, setCat] = useState("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [tableId, setTableId] = useState(initialTableId ?? "");
  const [customerId, setCustomerId] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ invoiceNo: string; total: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(
    () => products.filter((p) => cat === "all" || p.categoryId === cat),
    [products, cat]
  );
  const totals = useMemo(() => cartTotals(cart, discountType, discountValue), [cart, discountType, discountValue]);

  function add(p: Product, variantId?: string) {
    const variant = p.variants.find((v) => v.id === variantId);
    const key = p.id + (variantId ?? "");
    setCart((prev) => {
      const found = prev.find((l) => l.productId + (l.variantId ?? "") === key);
      if (found)
        return prev.map((l) => (l.productId + (l.variantId ?? "") === key ? { ...l, qty: l.qty + 1 } : l));
      return [
        ...prev,
        {
          productId: p.id,
          variantId,
          name: variant ? `${p.name} (${variant.name})` : p.name,
          price: p.price + (variant?.priceDelta ?? 0),
          qty: 1,
          note: "",
          gstRate: p.gstRate,
        },
      ];
    });
  }

  function bump(line: CartLine, delta: number) {
    const key = line.productId + (line.variantId ?? "");
    setCart((prev) =>
      prev
        .map((l) => (l.productId + (l.variantId ?? "") === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function setNote(line: CartLine, note: string) {
    const key = line.productId + (line.variantId ?? "");
    setCart((prev) => prev.map((l) => (l.productId + (l.variantId ?? "") === key ? { ...l, note } : l)));
  }

  function checkout(payments: Payment[]) {
    startTransition(async () => {
      const r = await placeOrder({
        tableId: tableId || undefined,
        customerId: customerId || undefined,
        lines: cart.map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty, note: l.note })),
        discountType,
        discountValue,
        payments,
      });
      if (r.ok) {
        setReceipt({ invoiceNo: r.data.invoiceNo, total: r.data.total });
        setCart([]);
        setPayOpen(false);
        setDiscountValue(0);
      } else toast.error(r.error);
    });
  }

  return (
    <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[1fr_380px] lg:px-6">
      {/* Menu */}
      <div className="flex flex-col gap-3">
        <Tabs value={cat} onValueChange={setCat}>
          <TabsList className="flex w-full flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="flex flex-col gap-2 p-3">
                <div className="font-medium leading-tight">{p.name}</div>
                <div className="text-sm text-muted-foreground">{inr(p.price)}</div>
                {p.variants.length === 0 ? (
                  <Button size="sm" onClick={() => add(p)} aria-label={`Add ${p.name}`}>
                    <PlusIcon className="size-4" /> Add
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => add(p)}>Std</Button>
                    {p.variants.map((v) => (
                      <Button key={v.id} size="sm" variant="outline" onClick={() => add(p, v.id)}>
                        {v.name} +{v.priceDelta}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="flex h-fit flex-col lg:sticky lg:top-4">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Current Order</h3>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                <Trash2Icon className="size-4" /> Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={tableId || "none"} onValueChange={(v) => setTableId(v === "none" ? "" : String(v))}>
              <SelectTrigger aria-label="Table"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Takeaway</SelectItem>
                {tables.filter((t) => t.status === "available" || t.id === tableId).map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name} ({t.seats})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customerId || "none"} onValueChange={(v) => setCustomerId(v === "none" ? "" : String(v))}>
              <SelectTrigger aria-label="Customer"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Walk-in</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {cart.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Cart empty — tap items to add.</p>}
            {cart.map((l) => (
              <div key={l.productId + (l.variantId ?? "")} className="rounded-md border p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{l.name}</span>
                  <span className="text-sm tabular-nums">{inr(l.price * l.qty)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-7" aria-label="Decrease" onClick={() => bump(l, -1)}>
                    <MinusIcon className="size-3" />
                  </Button>
                  <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                  <Button variant="outline" size="icon" className="size-7" aria-label="Increase" onClick={() => bump(l, 1)}>
                    <PlusIcon className="size-3" />
                  </Button>
                  <Input
                    className="h-7 flex-1 text-xs"
                    placeholder="Note (less sugar…)"
                    value={l.note}
                    onChange={(e) => setNote(l, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as "percent" | "flat")}>
              <SelectTrigger aria-label="Discount type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Discount %</SelectItem>
                <SelectItem value="flat">Discount ₹</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" min="0" step="0.01" value={discountValue} aria-label="Discount value"
              onChange={(e) => setDiscountValue(Number(e.target.value))} />
          </div>

          <div className="space-y-1 border-t pt-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{inr(totals.subtotal)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Discount</span><span className="tabular-nums">−{inr(totals.discount)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST</span><span className="tabular-nums">{inr(totals.taxAmount)}</span></div>
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular-nums">{inr(totals.total)}</span></div>
          </div>

          <Button size="lg" disabled={cart.length === 0 || pending} onClick={() => setPayOpen(true)}>
            <ReceiptIcon className="size-4" /> Charge {inr(totals.total)}
          </Button>
        </CardContent>
      </Card>

      <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} total={totals.total} pending={pending} onPay={checkout} />

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Order placed</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <Badge variant="secondary" className="text-lg">{receipt?.invoiceNo}</Badge>
            <p className="text-2xl font-bold tabular-nums">{inr(receipt?.total ?? 0)}</p>
            <p className="text-sm text-muted-foreground">KOT sent to kitchen. Stock deducted.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
            <Button onClick={() => setReceipt(null)}>New Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaymentDialog({
  open, onClose, total, pending, onPay,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  pending: boolean;
  onPay: (payments: Payment[]) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState(total);
  const [split, setSplit] = useState(false);
  const [second, setSecond] = useState<{ method: PaymentMethod; amount: number }>({ method: "upi", amount: 0 });

  const firstAmount = split ? tendered : total;
  const payments: Payment[] = split
    ? [
        { method, amount: firstAmount },
        { method: second.method, amount: Math.max(0, Math.round((total - firstAmount) * 100) / 100) },
      ]
    : [{ method, amount: total }];
  const change = !split && method === "cash" ? Math.max(0, tendered - total) : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Payment — {inr(total)}</DialogTitle></DialogHeader>
        <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)} className="flex gap-4">
          {(["cash", "upi", "card"] as const).map((m) => (
            <div key={m} className="flex items-center gap-2">
              <RadioGroupItem value={m} id={`m-${m}`} />
              <Label htmlFor={`m-${m}`} className="uppercase">{m}</Label>
            </div>
          ))}
        </RadioGroup>

        {method === "cash" && !split && (
          <div className="grid gap-1.5">
            <Label htmlFor="tendered">Tendered</Label>
            <Input id="tendered" type="number" min="0" step="0.01" value={tendered} onChange={(e) => setTendered(Number(e.target.value))} />
            {change > 0 && <p className="text-sm">Change: <span className="font-semibold">{inr(change)}</span></p>}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input type="checkbox" id="split" checked={split} onChange={(e) => setSplit(e.target.checked)} />
          <Label htmlFor="split">Split payment</Label>
        </div>
        {split && (
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="firstAmt">{method.toUpperCase()} amount</Label>
              <Input id="firstAmt" type="number" min="0" step="0.01" value={tendered} onChange={(e) => setTendered(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label>Rest via</Label>
              <Select value={second.method} onValueChange={(v) => setSecond({ ...second, method: v as PaymentMethod })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["cash", "upi", "card"] as const).filter((m) => m !== method).map((m) => (
                    <SelectItem key={m} value={m}>{m.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm tabular-nums">{inr(Math.max(0, total - tendered))}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button disabled={pending || (split && tendered <= 0)} onClick={() => onPay(payments)}>
            {pending ? "Processing…" : `Confirm ${inr(total)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
