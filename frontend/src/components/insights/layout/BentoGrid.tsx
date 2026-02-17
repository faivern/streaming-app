import React from "react";
import { motion } from "framer-motion";

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function BentoGrid({ children, className = "" }: BentoGridProps) {
  return (
    <motion.div
      className={`grid gap-4 grid-cols-1 md:grid-cols-4 lg:grid-cols-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={cardVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
