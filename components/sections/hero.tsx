"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { ShinyText } from "@/components/ui/reactbits/shiny-text";
import { Counter } from "@/components/ui/reactbits/counter";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.border/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/30)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,black,transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <ShinyText
              text="Now in private beta across 50+ Indian cafés"
              color="currentColor"
              shineColor="#f59e0b"
              speed={3}
            />
          </Badge>

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The cloud OS that runs your entire{" "}
            <span className="relative inline-flex bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              café
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Billing, POS, inventory, kitchen, CRM, reports, and AI analytics — in
            one beautifully designed dashboard. Built for independent cafés,
            bakeries, QSRs, and growing chains.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto">
              <SignUpButton mode="modal">
                <span className="absolute inset-0" />
              </SignUpButton>
              <span className="relative z-10 inline-flex items-center gap-2">
                Start free for 14 days
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-500 to-orange-500 transition-transform duration-500 group-hover:translate-x-0" />
            </div>
            <Link
              href="#modules"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required · Free for your first outlet · Cancel anytime
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="group rounded-xl border border-border/60 bg-card p-2 shadow-2xl shadow-foreground/5 transition-shadow hover:shadow-amber-500/10">
            <div className="overflow-hidden rounded-lg border border-border/40 bg-background">
              <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/50 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <div className="ml-4 text-xs text-muted-foreground">
                  app.cafeos.in/dashboard
                </div>
                <div className="ml-auto flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                  </span>
                  LIVE
                </div>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-[180px_1fr]">
                <div className="hidden bg-background p-4 sm:block">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Today
                  </div>
                  <div className="space-y-2.5">
                    {["Sales", "Orders", "Low stock", "Top products"].map((l, i) => (
                      <motion.div
                        key={l}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted/60"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {l}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-background p-4 sm:p-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { l: "Sales", v: 24810, prefix: "₹", suffix: "", trend: "+18%" },
                      { l: "Orders", v: 186, prefix: "", suffix: "", trend: "+12%" },
                      { l: "Avg. ticket", v: 133, prefix: "₹", suffix: "", trend: "+4%" },
                      { l: "Low stock", v: 3, prefix: "", suffix: "", trend: "alert" },
                    ].map((m, i) => (
                      <motion.div
                        key={m.l}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="group/metric rounded-lg border border-border/40 bg-card p-3 transition-colors hover:border-amber-500/30"
                      >
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {m.l}
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-1 text-lg font-semibold">
                          {m.prefix && <span>{m.prefix}</span>}
                          <Counter
                            value={m.v}
                            fontSize={18}
                            textColor="currentColor"
                          />
                        </div>
                        <div className="mt-0.5 text-[10px] text-amber-600">
                          {m.trend}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-7">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 100 }}
                        className="flex flex-col items-center gap-1.5 origin-bottom"
                      >
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-amber-500/20 to-amber-500 transition-all hover:from-amber-500/30 hover:to-orange-500"
                          style={{ height: `${30 + ((i * 13) % 60)}px` }}
                        />
                        <div className="text-[10px] text-muted-foreground">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
