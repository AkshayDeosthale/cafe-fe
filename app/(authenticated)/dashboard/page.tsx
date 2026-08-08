import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {

  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, StatCard, StatusBadge } from "@/components/shared/misc";
import { DashboardChart } from "@/features/dashboard/chart";
import { getDashboardStats } from "@/lib/actions/reports";
import { formatTime, inr } from "@/lib/utils/format";
import { PlusIcon, ShoppingCartIcon } from "lucide-react";


export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Dashboard" description="Today at a glance">
        <Button nativeButton={false} render={<Link href="/pos" />}>
          <ShoppingCartIcon className="size-4" /> New Order
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
          <PlusIcon className="size-4" /> Add Product
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-6 xl:grid-cols-4">
        <StatCard label="Today's Sales" value={inr(stats.todaySales)} />
        <StatCard label="Orders Today" value={String(stats.todayOrders)} />
        <StatCard label="Low Stock Items" value={String(stats.lowStock)} hint={stats.lowStock > 0 ? "Reorder needed" : "All good"} />
        <StatCard label="Tables Occupied" value={`${stats.activeTables}/${stats.totalTables}`} />
      </div>

      <div className="grid gap-4 px-4 lg:grid-cols-[2fr_1fr] lg:px-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            {stats.sales.length === 0 ? (
              <EmptyState title="No sales yet" hint="Place an order on POS to see the trend." />
            ) : (
              <DashboardChart data={stats.sales} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Products</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            )}
            {stats.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                  {p.name}
                </span>
                <span className="tabular-nums text-muted-foreground">{p.qty} sold</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 px-4 lg:grid-cols-[2fr_1fr] lg:px-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/orders" />}>View all</Button>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.invoiceNo}</TableCell>
                      <TableCell className="text-right tabular-nums">{inr(o.total)}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-muted-foreground">{formatTime(o.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Inventory Alerts</CardTitle>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/inventory" />}>Manage</Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {stats.lowStockItems.length === 0 && (
              <p className="text-sm text-muted-foreground">Stock levels healthy.</p>
            )}
            {stats.lowStockItems.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.name}</span>
                <Badge variant="destructive" className="tabular-nums">
                  {i.stock.toLocaleString("en-IN")} {i.unit} left
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
