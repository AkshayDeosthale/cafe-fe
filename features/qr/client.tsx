"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/misc";
import type { CafeTable } from "@/lib/types";
import { PrinterIcon } from "lucide-react";

function orderUrl(tableId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/order/${tableId}`;
}

function qrSrc(tableId: string): string {
  const url = orderUrl(tableId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

export function QrClient({ tables }: { tables: CafeTable[] }) {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex justify-end print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <PrinterIcon className="size-4" /> Print All Cards
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((t) => (
          <Card key={t.id} className="break-inside-avoid">
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex w-full items-center justify-between">
                <span className="font-semibold">{t.name}</span>
                <StatusBadge status={t.status} />
              </div>
              {/* ponytail: external QR API, needs internet. Offline → mini encoder later. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrSrc(t.id)} alt={`QR for ${t.name}`} width={160} height={160} className="rounded-md" />
              <p className="text-xs break-all text-muted-foreground">{orderUrl(t.id)}</p>
              <p className="text-sm text-muted-foreground">Scan to order from {t.name} · {t.zone}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
