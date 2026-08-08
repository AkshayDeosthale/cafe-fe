import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpenIcon } from "lucide-react";

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
      <PackageOpenIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

const TONES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  available: "secondary",
  occupied: "default",
  reserved: "outline",
  cleaning: "outline",
  pending: "outline",
  preparing: "default",
  ready: "secondary",
  served: "secondary",
  completed: "secondary",
  cancelled: "destructive",
  active: "secondary",
  inactive: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={TONES[status] ?? "outline"} className="capitalize">{status}</Badge>;
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  );
}
