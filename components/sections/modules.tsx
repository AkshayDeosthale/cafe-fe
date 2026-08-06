"use client";

import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Package,
  Truck,
  ChefHat,
  QrCode,
  Users,
  Receipt,
  TrendingUp,
  HeartHandshake,
  Store,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/reactbits/spotlight-card";

const modules = [
  {
    icon: Receipt,
    name: "POS & Billing",
    description: "Touch-friendly checkout, discounts, taxes, split payments, and digital receipts.",
  },
  {
    icon: UtensilsCrossed,
    name: "Products & Recipes",
    description: "Menu with variants, ingredients, BOM, and food-cost tracking per dish.",
  },
  {
    icon: Package,
    name: "Inventory",
    description: "Ingredient stock, units, waste logs, adjustments, and low-stock alerts.",
  },
  {
    icon: Truck,
    name: "Suppliers & Purchases",
    description: "Supplier CRM, purchase entries, invoices, and cost-price history.",
  },
  {
    icon: ChefHat,
    name: "Kitchen Display",
    description: "Live KOTs, course routing, and prep-time tracking on any screen.",
  },
  {
    icon: QrCode,
    name: "QR Ordering",
    description: "Let customers order and pay from their table with branded QR menus.",
  },
  {
    icon: Users,
    name: "Customers & CRM",
    description: "Order history, preferences, feedback, and targeted campaigns.",
  },
  {
    icon: TrendingUp,
    name: "Reports & AI",
    description: "Sales, menu mix, wastage, and AI-powered demand forecasts.",
  },
  {
    icon: HeartHandshake,
    name: "Loyalty",
    description: "Points, rewards, coupons, and membership tiers that drive repeat visits.",
  },
  {
    icon: Store,
    name: "Multi-outlet",
    description: "Centralised menu, stock, and reporting across every location.",
  },
];

export function Modules() {
  return (
    <section id="modules" className="border-y border-border/60 bg-muted/20 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One platform. Every function.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with billing. Expand into a complete operating system as you
            grow.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
            >
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.15)"
                className="h-full p-5 transition-all hover:-translate-y-1"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-amber-500/15 group-hover:text-amber-600">
                  <m.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{m.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
