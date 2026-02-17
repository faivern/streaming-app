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
    <div
      className={`bg-component-primary/60 backdrop-blur-md border border-border/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full ${className}`}
    >
      {title && (
        <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
