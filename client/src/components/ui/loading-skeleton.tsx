import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "circle" | "villa";
  lines?: number;
  animate?: boolean;
}

export function LoadingSkeleton({ 
  className,
  variant = "text",
  lines = 3,
  animate = true
}: LoadingSkeletonProps) {
  const waveAnimation = animate ? {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
  } : {};

  const waveTransition = animate ? {
    duration: 2,
    ease: "easeInOut",
    repeat: Infinity
  } : {};

  const skeletonBase = cn(
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
    animate && "bg-[length:200%_100%]",
    className
  );

  if (variant === "card") {
    return (
      <div className={cn("space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border", className)}>
        <motion.div
          className={cn(skeletonBase, "h-48 rounded-lg")}
          animate={waveAnimation}
          transition={waveTransition}
        />
        <div className="space-y-2">
          <motion.div
            className={cn(skeletonBase, "h-6 rounded")}
            animate={waveAnimation}
            transition={{ ...waveTransition, delay: 0.1 }}
          />
          <motion.div
            className={cn(skeletonBase, "h-4 rounded w-3/4")}
            animate={waveAnimation}
            transition={{ ...waveTransition, delay: 0.2 }}
          />
        </div>
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <motion.div
        className={cn(skeletonBase, "rounded-full w-12 h-12", className)}
        animate={waveAnimation}
        transition={waveTransition}
      />
    );
  }

  if (variant === "villa") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header skeleton */}
        <div className="space-y-3">
          <motion.div
            className={cn(skeletonBase, "h-8 rounded w-1/2")}
            animate={waveAnimation}
            transition={waveTransition}
          />
          <motion.div
            className={cn(skeletonBase, "h-4 rounded w-3/4")}
            animate={waveAnimation}
            transition={{ ...waveTransition, delay: 0.1 }}
          />
        </div>

        {/* Image gallery skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(skeletonBase, "aspect-video rounded-lg")}
              animate={waveAnimation}
              transition={{ ...waveTransition, delay: i * 0.1 }}
            />
          ))}
        </div>

        {/* Details skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <motion.div
                className={cn(skeletonBase, "h-5 rounded w-1/4")}
                animate={waveAnimation}
                transition={{ ...waveTransition, delay: 0.3 + i * 0.1 }}
              />
              <motion.div
                className={cn(skeletonBase, "h-4 rounded")}
                animate={waveAnimation}
                transition={{ ...waveTransition, delay: 0.4 + i * 0.1 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default text variant
  return (
    <div className={cn("space-y-2", className)}>
      {[...Array(lines)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            skeletonBase,
            "h-4 rounded",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
          animate={waveAnimation}
          transition={{ ...waveTransition, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

interface LoadingGridProps {
  items?: number;
  columns?: number;
  className?: string;
}

export function LoadingGrid({ 
  items = 6, 
  columns = 3, 
  className 
}: LoadingGridProps) {
  return (
    <div className={cn(
      `grid gap-6`,
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {[...Array(items)].map((_, i) => (
        <LoadingSkeleton key={i} variant="card" animate />
      ))}
    </div>
  );
}

interface LoadingListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function LoadingList({ 
  items = 5, 
  showAvatar = false, 
  className 
}: LoadingListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
          {showAvatar && <LoadingSkeleton variant="circle" />}
          <div className="flex-1 space-y-2">
            <LoadingSkeleton className="h-5 w-1/3" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}