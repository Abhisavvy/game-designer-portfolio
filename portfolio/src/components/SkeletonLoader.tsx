import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Skeleton loading component with shimmer animation
 * Provides visual feedback while content loads
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/50 relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-zinc-700/20 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

/**
 * Project card skeleton matching the actual layout
 */
export function ProjectCardSkeleton() {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 px-3 lg:px-4 mb-6 lg:mb-8">
      <div className="group relative cursor-pointer w-full">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10] min-h-[280px] bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden border border-zinc-700/50">
          
          {/* Image placeholder */}
          <Skeleton className="absolute inset-0" />
          
          {/* Icon placeholder */}
          <Skeleton className="absolute top-4 left-4 w-12 h-12 rounded-full" />
          
          {/* Tag placeholder */}
          <div className="absolute top-4 right-4 max-w-[60%]">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          
          {/* Content area */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Title */}
            <Skeleton className="h-7 w-3/4 mb-2" />
            
            {/* Description */}
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero section skeleton
 */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <div className="space-y-8">
          {/* Headline */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-12 w-2/3 mx-auto" />
          </div>
          
          {/* Subline */}
          <div className="space-y-2 max-w-3xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6 mx-auto" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>
          
          {/* Profile image placeholder */}
          <Skeleton className="w-32 h-32 rounded-full mx-auto" />
          
          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
          
          {/* CTA Button */}
          <Skeleton className="h-14 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </section>
  );
}