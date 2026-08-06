"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SpotlightCard } from "@/components/ui/reactbits/spotlight-card";

const testimonials = [
  {
    quote:
      "We replaced three different apps with CaféOS. Billing, inventory, and customer tracking finally talk to each other.",
    author: "Priya Menon",
    role: "Owner, Third Wave Brew",
  },
  {
    quote:
      "The low-stock alerts and purchase suggestions alone saved us 12% on ingredient costs in the first quarter.",
    author: "Rohit Chawla",
    role: "Operations Head, Brew & Bite",
  },
  {
    quote:
      "It looks and feels like modern software. My staff learned the POS in under 30 minutes.",
    author: "Anjali Iyer",
    role: "Founder, Sourdough Studio",
  },
];

export function Testimonials() {
  return (
    <section className="border-y border-border/60 bg-muted/20 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Loved by food founders
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Early teams across India are already running their stores on CaféOS.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <SpotlightCard
                spotlightColor="rgba(245, 158, 11, 0.2)"
                className="h-full p-6"
              >
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-foreground">
                  “{t.quote}”
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-sm font-semibold text-white">
                    {t.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.author}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
