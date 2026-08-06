"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.25)",
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = divRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (divRef.current) {
      divRef.current.style.setProperty("--mouse-x", `${x}px`);
      divRef.current.style.setProperty("--mouse-y", `${y}px`);
      divRef.current.style.setProperty("--spotlight-color", spotlightColor);
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card",
        className
      )}
      style={{
        ["--mouse-x" as never]: "50%",
        ["--mouse-y" as never]: "50%",
        ["--spotlight-color" as never]: spotlightColor,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)",
          opacity,
        }}
      />
      {children}
    </div>
  );
}
