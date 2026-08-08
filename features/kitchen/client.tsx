"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/misc";
import { setOrderStatus } from "@/lib/actions/orders";
import type { CafeTable, Order, OrderStatus } from "@/lib/types";
import { elapsedBucket, elapsedMinutes } from "@/lib/utils/format";

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: "pending", title: "Incoming" },
  { status: "preparing", title: "Preparing" },
  { status: "ready", title: "Ready" },
  { status: "served", title: "Served" },
];

const NEXT: Partial<Record<OrderStatus, { label: string; to: OrderStatus }>> = {
  pending: { label: "Start", to: "preparing" },
  preparing: { label: "Ready", to: "ready" },
  ready: { label: "Served", to: "served" },
  served: { label: "Done", to: "completed" },
};

const PREV: Partial<Record<OrderStatus, OrderStatus>> = {
  preparing: "pending",
  ready: "preparing",
  served: "ready",
};

const BUCKET_VARIANT = { green: "secondary", amber: "outline", red: "destructive" } as const;

export function KitchenClient({ orders, tables }: { orders: Order[]; tables: CafeTable[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [, setTick] = useState(0);

  // re-render every 30s so elapsed badges stay honest
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  // refresh server data every 15s — kitchen screens must stay live
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(t);
  }, [router]);

  function act(id: string, to: OrderStatus) {
    startTransition(async () => {
      const r = await setOrderStatus(id, to);
      if (!r.ok) toast.error(r.error);
    });
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <EmptyState title="Kitchen is clear" hint="New orders appear here automatically." />
      </div>
    );
  }

  return (
    <div className="grid gap-4 px-4 sm:grid-cols-2 lg:px-6 xl:grid-cols-4">
      {COLUMNS.map((col) => {
        const list = orders.filter((o) => o.status === col.status);
        return (
          <div key={col.status} className="flex flex-col gap-2">
            <h3 className="flex items-center justify-between text-sm font-semibold">
              {col.title}
              <Badge variant="secondary">{list.length}</Badge>
            </h3>
            {list.map((o) => {
              const bucket = elapsedBucket(o.createdAt);
              return (
                <Card key={o.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span>{o.invoiceNo}</span>
                      <Badge variant={BUCKET_VARIANT[bucket]}>{elapsedMinutes(o.createdAt)}m</Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {tables.find((t) => t.id === o.tableId)?.name ?? "Takeaway"}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <ul className="space-y-1 text-sm">
                      {o.items.map((i, idx) => (
                        <li key={idx}>
                          <span className="font-medium">{i.qty}×</span> {i.name}
                          {i.note && <div className="text-xs text-muted-foreground">“{i.note}”</div>}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      {PREV[o.status] && (
                        <Button variant="outline" size="sm" onClick={() => act(o.id, PREV[o.status]!)}>
                          Recall
                        </Button>
                      )}
                      {NEXT[o.status] && (
                        <Button size="sm" className="flex-1" onClick={() => act(o.id, NEXT[o.status]!.to)}>
                          {NEXT[o.status]!.label}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
