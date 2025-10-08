"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

export default function SlideInOnScroll({
  children,
  delay = 0,
  direction = "right",
}: {
  children: ReactNode;
  delay?: number;
  direction?: "left" | "right" | "up" | "down";
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const dirMap: Record<string, { x: number; y: number }> = {
    left: { x: -60, y: 0 },
    right: { x: 60, y: 0 },
    up: { x: 0, y: -60 },
    down: { x: 0, y: 60 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...(dirMap[direction] ?? dirMap.right) }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}


