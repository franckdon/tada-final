"use client";

import { type Permission } from "@/lib/rbac/roles";
import { usePermissions } from "@/hooks/use-permissions";
import Link from "next/link";
import { cn } from "@tada/ui/lib/utils";

interface SidebarItemWithPermissionProps {
  icon: React.ReactNode;
  text: string;
  href: string;
  active?: boolean;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
}

/**
 * Sidebar item that only renders if user has required permissions
 */
export function SidebarItemWithPermission({
  icon,
  text,
  href,
  active,
  permission,
  permissions = [],
  requireAll = true,
}: SidebarItemWithPermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Check permissions
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Don't render if no access
  if (!hasAccess) {
    return null;
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <span className={cn("mr-3", active ? "text-blue-600" : "text-gray-500")}>
        {icon}
      </span>
      {text}
    </Link>
  );
}

interface SidebarGroupWithPermissionProps {
  title: string;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
}

/**
 * Sidebar group that only renders if user has required permissions
 */
export function SidebarGroupWithPermission({
  title,
  permission,
  permissions = [],
  requireAll = true,
  children,
}: SidebarGroupWithPermissionProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

  // Check permissions
  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Don't render if no access
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
