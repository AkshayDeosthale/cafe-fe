import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export function Pagination({
  total,
  page,
  pageSize,
  searchParams,
}: {
  total: number;
  page: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v) q.set(k, v);
    q.set("page", String(p));
    return `?${q.toString()}`;
  };
  return (
    <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
      <span>
        Page {page} of {pages} · {total} items
      </span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={page <= 1} nativeButton={false} render={<Link href={href(page - 1)} />}>
          <ChevronLeftIcon className="size-4" /> Prev
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} nativeButton={false} render={<Link href={href(page + 1)} />}>
          Next <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
