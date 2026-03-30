import { memo } from "react";
import { motion } from "framer-motion";

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const orbTransition = (duration: number) => ({
  duration,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: "easeInOut",
});

function AiCinematicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Gradient orb 1 */}
      <motion.div
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
        animate={{
          x: [0, 120, -60, 0],
          y: [0, 80, -40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={orbTransition(18)}
      />

      {/* Gradient orb 2 */}
      <motion.div
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
        animate={{
          x: [0, -100, 80, 0],
          y: [0, -60, 50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={orbTransition(16)}
      />

      {/* Gradient orb 3 */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: "40%",
          left: "30%",
          background:
            "radial-gradient(circle, var(--accent-primary), transparent 70%)",
          opacity: 0.05,
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 70, -50, 0],
          scale: [1, 1.1, 0.92, 1],
        }}
        transition={orbTransition(20)}
      />

      {/* Film grain overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          opacity: 0.035,
          mixBlendMode: "overlay",
          animation: "grain 8s steps(10) infinite",
        }}
      />

      {/* Spotlight sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, var(--accent-primary), transparent 60%)",
          opacity: 0.05,
        }}
        animate={{ x: [-200, 200] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default memo(AiCinematicBackground);
