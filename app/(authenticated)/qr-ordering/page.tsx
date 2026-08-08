import { getTables } from "@/lib/actions/orders";
import { PageHeader } from "@/components/shared/page-header";
import { QrClient } from "@/features/qr/client";


export default async function QrOrderingPage() {
  const tables = await getTables();
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="QR Ordering" description="Per-table QR — customers scan, browse, order (no app)" />
      <QrClient tables={tables} />
    </div>
  );
}

export const dynamic = "force-dynamic";
