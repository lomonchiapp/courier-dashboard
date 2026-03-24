import { motion } from "motion/react";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

export function AnimateOnScroll({
  children,
  delay = 0,
  className,
  direction = "up",
}: AnimateOnScrollProps) {
  const offset = { up: { y: 32 }, left: { x: -32 }, right: { x: 32 } };
  const initial = { opacity: 0, ...offset[direction] };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
