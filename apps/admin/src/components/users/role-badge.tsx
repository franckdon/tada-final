"use client";

import { Badge } from "@tada/ui/components/badge";
import { ROLE_METADATA, type UserRole } from "@/lib/rbac/roles";
import { Shield, UserCog, Users, CheckCircle } from "lucide-react";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

const ICON_MAP = {
  Shield: Shield,
  UserCog: UserCog,
  Users: Users,
  CheckCircle: CheckCircle,
};

export function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const metadata = ROLE_METADATA[role];
  
  if (!metadata) {
    return <Badge variant="outline">{role}</Badge>;
  }
  
  const IconComponent = ICON_MAP[metadata.icon as keyof typeof ICON_MAP];
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  
  const colorVariants = {
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  return (
    <Badge 
      variant="outline" 
      className={`${sizeClasses[size]} ${colorVariants[metadata.color as keyof typeof colorVariants]} flex items-center gap-1.5`}
    >
      {IconComponent && <IconComponent className={iconSizes[size]} />}
      <span>{metadata.label}</span>
    </Badge>
  );
}
