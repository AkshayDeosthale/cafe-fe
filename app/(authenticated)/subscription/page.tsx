import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { CheckIcon } from "lucide-react";

// ponytail: static plan UI. Swap to Clerk <PricingTable /> when billing configured.
const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["1 outlet", "POS + Billing", "Basic inventory", "50 products"],
    current: true,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    features: ["Everything in Free", "Unlimited products", "Reports + CSV export", "Kitchen display", "QR ordering", "CRM + permissions"],
    current: false,
  },
  {
    name: "Enterprise",
    price: "₹2,999",
    period: "per month",
    features: ["Everything in Pro", "Multi-outlet", "AI analytics", "Delivery integrations", "Priority support"],
    current: false,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Subscription" description="Plan and billing" />
      <div className="grid gap-4 px-4 md:grid-cols-3 lg:px-6">
        {PLANS.map((p) => (
          <Card key={p.name} className={p.current ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                {p.current && <Badge>Current</Badge>}
              </div>
              <CardDescription>
                <span className="text-2xl font-semibold text-foreground">{p.price}</span>{" "}
                <span className="text-muted-foreground">{p.period}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckIcon className="size-4 text-green-600" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={p.current ? "outline" : "default"} disabled={p.current}>
                {p.current ? "Active Plan" : `Upgrade to ${p.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
