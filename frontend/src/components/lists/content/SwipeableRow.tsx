import { useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, Trash2 } from "lucide-react";

type SwipeableRowProps = {
  children: React.ReactNode;
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
};

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 300;

/**
 * Wraps a row element with horizontal swipe gestures via framer-motion.
 *
 * - Swipe right → green "Watched" action reveal
 * - Swipe left  → red "Remove" action reveal
 * - Below threshold → springs back with elastic feel
 * - Uses `useMotionValue` + `useTransform` so background opacity/scale
 *   updates happen in the animation frame loop without React re-renders.
 */
export default function SwipeableRow({
  children,
  onSwipeRight,
  onSwipeLeft,
}: SwipeableRowProps) {
  const x = useMotionValue(0);
  const [swiping, setSwiping] = useState(false);

  // Background opacity ramps from 0→1 as drag reaches threshold
  const rightBgOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Icon scales up as drag progresses
  const rightIconScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const leftIconScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.5]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setSwiping(false);
    const { offset, velocity } = info;

    // Check if swipe exceeded threshold (distance OR velocity)
    if (
      onSwipeRight &&
      (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY)
    ) {
      onSwipeRight();
    } else if (
      onSwipeLeft &&
      (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY)
    ) {
      onSwipeLeft();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Right swipe background (mark watched) */}
      {onSwipeRight && (
        <motion.div
          className="absolute inset-0 flex items-center pl-5 bg-green-600 rounded-lg"
          style={{ opacity: rightBgOpacity }}
        >
          <motion.div style={{ scale: rightIconScale }}>
            <Check className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      )}

      {/* Left swipe background (remove) */}
      {onSwipeLeft && (
        <motion.div
          className="absolute inset-0 flex items-center justify-end pr-5 bg-red-600 rounded-lg"
          style={{ opacity: leftBgOpacity }}
        >
          <motion.div style={{ scale: leftIconScale }}>
            <Trash2 className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>
      )}

      {/* Swipeable content layer */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.3}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x }}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className={`relative z-10 bg-[var(--background)] ${swiping ? "cursor-grabbing" : ""}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
