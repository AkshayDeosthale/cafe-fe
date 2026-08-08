"use client";

import { useRouter } from "next/navigation";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState, StatCard } from "@/components/shared/misc";
import { inr } from "@/lib/utils/format";
import { toCSV } from "@/lib/data/reports";
import { DownloadIcon } from "lucide-react";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

type Props = {
  summary: { revenue: number; orders: number; avgOrderValue: number; gstCollected: number };
  sales: { date: string; revenue: number; orders: number }[];
  top: { name: string; qty: number; revenue: number }[];
  categories: { name: string; value: number }[];
  payments: { name: string; value: number }[];
  usage: { id: string; name: string; unit: string; used: number; wasted: number }[];
  from?: string;
  to?: string;
};

export function ReportsClient({ summary, sales, top, categories, payments, usage, from, to }: Props) {
  const router = useRouter();

  function setRange(f?: string, t?: string) {
    const q = new URLSearchParams();
    if (f) q.set("from", f);
    if (t) q.set("to", t);
    router.replace(`?${q.toString()}`);
  }

  function preset(days: number) {
    const t = new Date();
    const f = new Date();
    f.setDate(f.getDate() - days + 1);
    setRange(f.toISOString().slice(0, 10), t.toISOString().slice(0, 10));
  }

  function downloadCSV(name: string, rows: Record<string, string | number>[]) {
    const blob = new Blob([toCSV(rows)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setRange()}>All time</Button>
        <Button variant="outline" size="sm" onClick={() => preset(1)}>Today</Button>
        <Button variant="outline" size="sm" onClick={() => preset(7)}>7 days</Button>
        <Button variant="outline" size="sm" onClick={() => preset(30)}>30 days</Button>
        <Input type="date" className="w-40" value={from ?? ""} aria-label="From"
          onChange={(e) => setRange(e.target.value || undefined, to)} />
        <Input type="date" className="w-40" value={to ?? ""} aria-label="To"
          onChange={(e) => setRange(from, e.target.value || undefined)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={inr(summary.revenue)} />
        <StatCard label="Orders" value={String(summary.orders)} />
        <StatCard label="Avg Order Value" value={inr(summary.avgOrderValue)} />
        <StatCard label="GST Collected" value={inr(summary.gstCollected)} />
      </div>

      {summary.orders === 0 ? (
        <EmptyState title="No data in range" hint="Place orders on POS to generate reports." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Sales by Day</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => downloadCSV("sales", sales)}>
                  <DownloadIcon className="size-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ revenue: { label: "Revenue", color: "var(--chart-1)" } }} className="h-64 w-full">
                  <AreaChart data={sales}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="revenue" fill="var(--chart-1)" fillOpacity={0.2} stroke="var(--chart-1)" />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Top Products</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => downloadCSV("top-products", top)}>
                  <DownloadIcon className="size-4" /> CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ qty: { label: "Qty", color: "var(--chart-2)" } }} className="h-64 w-full">
                  <BarChart data={top} layout="vertical">
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="qty" fill="var(--chart-2)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Category Split</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Revenue" } }} className="h-64 w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={categories} dataKey="value" nameKey="name" innerRadius={50} label>
                      {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Payment Methods</CardTitle></CardHeader>
              <CardContent>
                <ChartContainer config={{ value: { label: "Amount" } }} className="h-64 w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={payments} dataKey="value" nameKey="name" innerRadius={50} label>
                      {payments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Inventory Usage & Waste</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => downloadCSV("inventory-usage", usage)}>
                <DownloadIcon className="size-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              {usage.length === 0 ? (
                <p className="text-sm text-muted-foreground">No usage in range.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Used</TableHead>
                      <TableHead className="text-right">Wasted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{u.used.toLocaleString("en-IN")} {u.unit}</TableCell>
                        <TableCell className="text-right tabular-nums">{u.wasted.toLocaleString("en-IN")} {u.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
