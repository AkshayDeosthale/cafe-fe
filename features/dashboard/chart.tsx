"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function DashboardChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <ChartContainer config={{ revenue: { label: "Revenue", color: "var(--chart-1)" } }} className="h-64 w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={70} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="revenue" fill="var(--chart-1)" fillOpacity={0.2} stroke="var(--chart-1)" />
      </AreaChart>
    </ChartContainer>
  );
}
