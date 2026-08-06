"use client";

import { useEffect, useState } from "react";

interface CounterProps {
  value: number;
  fontSize?: number;
  textColor?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function Counter({
  value,
  fontSize = 100,
  textColor = "inherit",
  className,
  prefix,
  suffix,
}: CounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1500;
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.floor(from + (to - from) * easeOutCubic(progress));
      setDisplay(current);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span
      className={`inline-flex items-baseline tabular-nums ${className ?? ""}`}
      style={{ fontSize, color: textColor, lineHeight: 1 }}
    >
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
