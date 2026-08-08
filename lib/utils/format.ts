export function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function elapsedMinutes(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
}

/** green < 10min, amber < 20, red beyond — kitchen KOT urgency */
export function elapsedBucket(iso: string, now: Date = new Date()): "green" | "amber" | "red" {
  const m = elapsedMinutes(iso, now);
  return m < 10 ? "green" : m < 20 ? "amber" : "red";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
