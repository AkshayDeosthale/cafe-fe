"use client";

import { motion } from "framer-motion";
import {
  Zap,
  BarChart3,
  Users,
  Smartphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/reactbits/spotlight-card";

const features = [
  {
    icon: Zap,
    title: "Lightning-fast POS",
    description:
      "Touch-first billing designed for busy counters. One-tap categories, variants, modifiers, and split payments.",
  },
  {
    icon: BarChart3,
    title: "Live business analytics",
    description:
      "Track sales, costs, waste, and profit in real time. Spot trends before they become problems.",
  },
  {
    icon: Users,
    title: "Customer CRM built-in",
    description:
      "Know your regulars. Capture orders, preferences, birthdays, and run loyalty without a separate tool.",
  },
  {
    icon: Smartphone,
    title: "Works on every device",
    description:
      "Desktop, tablet, or mobile. The same beautiful experience in the store, kitchen, or on the go.",
  },
  {
    icon: ShieldCheck,
    title: "GST & invoicing ready",
    description:
      "Built for Indian compliance. Item-wise GST, invoices, KOTs, and purchase entries out of the box.",
  },
  {
    icon: Sparkles,
    title: "AI that saves hours",
    description:
      "Smart reorder suggestions, demand forecasting, and automated supplier reminders.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to run the floor
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We combined billing, operations, and intelligence into one simple
            platform — so you can stop stitching tools together.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.18)"
                className="h-full p-6 transition-all hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
