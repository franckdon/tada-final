"use client";

import { useEffect, useState } from "react";
import { cn } from "@tada/ui/lib/utils";

interface LayoutClientWrapperProps {
  children: React.ReactNode;
  fontVariable: string;
}

export function LayoutClientWrapper({ children, fontVariable }: LayoutClientWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering the UI on the client side
  if (!mounted) {
    return (
      <div className={cn(
        fontVariable,
        "whitespace-pre-line overscroll-none antialiased font-sans flex items-center justify-center min-h-screen"
      )}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
