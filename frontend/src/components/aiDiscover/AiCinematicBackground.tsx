import { memo } from "react";

function AiCinematicBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ clipPath: "inset(0)" }}
    >
      {/* Top-left accent glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          top: "-10%",
          left: "-5%",
          background:
            "radial-gradient(circle, var(--accent-primary), transparent 70%)",
          opacity: 0.07,
          filter: "blur(100px)",
        }}
      />

      {/* Bottom-right secondary glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          bottom: "-15%",
          right: "-10%",
          background:
            "radial-gradient(circle, var(--accent-secondary), transparent 70%)",
          opacity: 0.06,
          filter: "blur(100px)",
        }}
      />

      {/* Center accent glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: "40%",
          left: "30%",
          background:
            "radial-gradient(circle, var(--accent-primary), transparent 70%)",
          opacity: 0.04,
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}

export default memo(AiCinematicBackground);
