import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Container } from "@/components/ui/Container";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 50000, suffix: "+", label: "Envíos gestionados" },
  { value: 99.2, suffix: "%", label: "Entregas a tiempo" },
  { value: 200, suffix: "+", label: "Couriers activos" },
  { value: 12, suffix: "", label: "Países en LATAM" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;

    const isDecimal = value % 1 !== 0;
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = value * eased;
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  const display =
    value >= 1000
      ? `${(count / 1000).toFixed(count >= 1000 ? 0 : 0)}K`
      : value % 1 !== 0
        ? count.toFixed(1)
        : count;

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section className="py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-surface-700/50 bg-gradient-to-br from-surface-900 to-surface-950 p-10 sm:p-14"
        >
          {/* Subtle glow */}
          <div className="pointer-events-none absolute -top-20 right-0 h-60 w-60 rounded-full bg-primary-500/10 blur-[80px]" />

          <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-4xl font-bold text-primary-400 sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
