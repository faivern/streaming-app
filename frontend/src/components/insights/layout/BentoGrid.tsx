import React from "react";
import { motion } from "framer-motion";

type BentoGridProps = {
  children: React.ReactNode;
  layout?: string[];
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export default function BentoGrid({ children, layout, className = "" }: BentoGridProps) {
  return (
    <motion.div
      className={`grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, i) => (
        <motion.div variants={cardVariants} className={layout?.[i] ?? ""}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
