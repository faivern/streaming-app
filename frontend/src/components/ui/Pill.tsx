import React from "react";

type PillProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
};

const base =
  "inline-flex items-center gap-1 bg-badge-primary text-white px-3 py-1 " +
  "rounded-full border border-badge-foreground shadow-sm";

export default function Pill({
  children,
  icon,
  className = "",
  title,
}: PillProps) {
  return (
    <span title={title} className={`${base} ${className}`}>
      {icon && <span className="grid place-items-center">{icon}</span>}
      {children}
    </span>
  );
}
