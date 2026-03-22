import { motion } from "framer-motion";

type BaseInsightCardProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export default function BaseInsightCard({
  children,
  className = "",
  title,
}: BaseInsightCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden bg-component-primary/60 backdrop-blur-md border border-border/40 rounded-2xl p-6 shadow-xl hover:shadow-[0_4px_30px_-4px] hover:shadow-accent-primary/15 transition-shadow duration-300 h-full ${className}`}
    >
      {/* Gradient top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: "var(--gradient)" }}
      />

      {/* Subtle inner gradient overlay for depth */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary/[0.03] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-[1]">
        {title && (
          <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-3">
            {title}
          </h3>
        )}
        {children}
      </div>
    </motion.div>
  );
}
