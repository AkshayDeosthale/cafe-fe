"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { ShinyText } from "@/components/ui/reactbits/shiny-text";
import { Counter } from "@/components/ui/reactbits/counter";
import { GradientWaves } from "@/components/ui/reactbits/gradient-waves";

function AnimatedStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <Counter value={value} fontSize={36} textColor="currentColor" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function CTA() {
  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
     
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute inset-0">
            <GradientWaves
              horizonColor="#7c2d12"
              waveColor="#f59e0b"
              crestColor="#fff7ed"
              speed={0.4}
              amplitude={2.5}
              waveScale={0.6}
              waveRatio={0.9}
              swell={35}
              turbulence={20}
              tilt={1.11}
              zoom={1}
              height={5.5}
              fogDepth={15}
              detail="medium"
              brightness={1}
              opacity={1}
              mouseInteraction
              parallaxStrength={0.5}
              grain
              grainIntensity={0.05}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="aurora-blob aurora-blob-1 opacity-60" />
            <div className="aurora-blob aurora-blob-2 opacity-60" />
            <div className="aurora-blob aurora-blob-3 opacity-60" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-background/60">
              <AnimatedStat value={1200} label="cafés onboarded" />
              <div className="hidden h-8 w-px bg-background/20 sm:block" />
              <AnimatedStat value={98} label="% uptime" />
              <div className="hidden h-8 w-px bg-background/20 sm:block" />
              <AnimatedStat value={32} label="cities live" />
            </div>

            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold text-background sm:text-4xl">
              Ready to see what your café can{" "}
              <ShinyText
                text="really do"
                color="#fef3c7"
                shineColor="#fbbf24"
                speed={2.5}
                className="font-semibold"
              />
              ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-background/70 sm:text-lg">
              Join the early teams running their stores on a platform built for
              the future of food service. Free for your first outlet.
            </p>
            <div className="group relative mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-background px-6 text-sm font-medium text-foreground transition-all hover:bg-background/90 hover:shadow-xl hover:shadow-amber-500/20">
              <SignUpButton mode="modal">
                <span className="absolute inset-0" />
              </SignUpButton>
              Start your free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
