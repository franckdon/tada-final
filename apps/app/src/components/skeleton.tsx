"use client";
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div
      className={`
          animate-pulse 
          bg-muted 
          rounded-md 
          ${className || "h-4 w-full"}
        `}
    >
      {children}
    </div>
  );
}
