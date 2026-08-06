"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { SpotlightCard } from "@/components/ui/reactbits/spotlight-card";

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "/month",
    description: "Perfect for a single café trying the platform.",
    features: [
      "1 outlet",
      "Up to 100 products",
      "POS + basic reports",
      "Email support",
      "QR ordering",
    ],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    description: "For cafés ready to automate operations.",
    features: [
      "Up to 3 outlets",
      "Unlimited products",
      "Inventory & recipes",
      "Suppliers & purchases",
      "Kitchen display system",
      "CRM & loyalty",
      "Priority chat support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    description: "For chains, franchises, and enterprise operations.",
    features: [
      "Unlimited outlets",
      "Multi-brand management",
      "Advanced AI analytics",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & onboarding",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when you grow. No hidden commissions.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative ${plan.highlighted ? "pt-3 lg:-translate-y-2" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/30">
                  Most popular
                </div>
              )}
              <SpotlightCard
                spotlightColor={
                  plan.highlighted
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(255, 255, 255, 0.08)"
                }
                className={`relative h-full p-6 sm:p-8 ${
                  plan.highlighted
                    ? "border-amber-500/40 shadow-xl shadow-amber-500/10"
                    : ""
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`relative mt-8 inline-flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/80"
                      : "border border-border bg-background hover:bg-muted"
                  }`}
                >
                  <SignUpButton mode="modal">
                    <span className="absolute inset-0" />
                  </SignUpButton>
                  {plan.cta}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
