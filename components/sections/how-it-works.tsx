"use client";

import { motion } from "framer-motion";
import { Coffee, ArrowRight, Settings, Rocket } from "lucide-react";

const steps = [
  {
    icon: Coffee,
    title: "Add your menu",
    description:
      "Upload products, categories, variants, recipes, and GST rates in minutes.",
  },
  {
    icon: ArrowRight,
    title: "Start taking orders",
    description:
      "Use the touch POS or QR ordering. Bills, KOTs, and receipts are generated automatically.",
  },
  {
    icon: Settings,
    title: "Track everything live",
    description:
      "Inventory, suppliers, kitchen, and customer data stay in sync as orders flow in.",
  },
  {
    icon: Rocket,
    title: "Let AI do the rest",
    description:
      "Forecast demand, reduce waste, and get reorder suggestions before stock runs out.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Up and running in an afternoon
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No consultants, no multi-week setup. We built CaféOS so real
            restaurateurs can self-serve.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent lg:block" />
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group relative"
            >
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110">
                {i + 1}
              </div>
              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
