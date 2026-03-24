import { motion } from "motion/react";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ badge, title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-16 max-w-2xl text-center"
    >
      {badge && (
        <span className="mb-4 inline-block rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-400">
          {badge}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-surface-400">{subtitle}</p>
      )}
    </motion.div>
  );
}
