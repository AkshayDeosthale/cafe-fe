"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need a backend or developer to set up CaféOS?",
    a: "No. CaféOS is a cloud product — you sign up, add your menu, and start billing in minutes. No servers, no code, no consultants.",
  },
  {
    q: "Does it work offline?",
    a: "The POS buffers recent orders locally and syncs automatically when you reconnect. For a cloud-first product, we keep that gap minimal.",
  },
  {
    q: "What payment methods are supported?",
    a: "Cash, UPI, cards, and split payments. Digital wallets and online ordering are on the roadmap.",
  },
  {
    q: "Can I add multiple outlets later?",
    a: "Yes. Start with one outlet on the Starter plan and expand up to three on Growth, with unlimited outlets on Scale.",
  },
  {
    q: "Is my data safe?",
    a: "We use bank-grade encryption, daily backups, and are SOC 2 Type II audited. Your data is yours — export or delete it anytime.",
  },
  {
    q: "How does the AI analytics work?",
    a: "CaféOS analyses your sales, waste, and seasonal patterns to forecast demand, suggest reorders, and flag anomalies — without any extra setup.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="border-y border-border/60 bg-muted/20 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-border/60">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between text-left text-base font-medium transition-colors hover:text-foreground"
              >
                {faq.q}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="mt-3 overflow-hidden text-sm leading-relaxed text-muted-foreground"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
