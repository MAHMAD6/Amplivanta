"use client";

import { useInView } from "react-intersection-observer";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1500,
  className,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView({ threshold: 0, triggerOnce: true });
  const current = useAnimatedCounter(value, duration, inView);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {current}
      {suffix}
    </span>
  );
}
