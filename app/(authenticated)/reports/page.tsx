import {
  getCategorySplit, getInventoryUsage, getPaymentSplit, getReportSummary, getSalesByDay, getTopProducts,
} from "@/lib/actions/reports";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsClient } from "@/features/reports/client";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const from = sp.from;
  const to = sp.to;
  const [summary, sales, top, categories, payments, usage] = await Promise.all([
    getReportSummary(from, to),
    getSalesByDay(from, to),
    getTopProducts(5, from, to),
    getCategorySplit(from, to),
    getPaymentSplit(from, to),
    getInventoryUsage(from, to),
  ]);
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Reports" description="Revenue, GST, top products, inventory usage" />
      <ReportsClient
        summary={summary}
        sales={sales}
        top={top}
        categories={categories}
        payments={payments}
        usage={usage}
        from={from}
        to={to}
      />
    </div>
  );
}
