import React from "react";

type PillProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
};

const base =
  "inline-flex items-center gap-1 bg-gray-800/70 text-white px-3 py-1 " +
  "rounded-full border border-gray-600/50 shadow-sm";

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
