"use client";

import { ReactNode } from "react";
import { hasPermission, type Permission, type UserRole } from "./roles";

interface PermissionGuardProps {
  userRole: UserRole;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component guard that renders children only if user has permission
 */
export function PermissionGuard({
  userRole,
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  if (!hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AnyPermissionGuardProps {
  userRole: UserRole;
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component guard that renders children if user has any of the permissions
 */
export function AnyPermissionGuard({
  userRole,
  permissions,
  children,
  fallback = null,
}: AnyPermissionGuardProps) {
  const hasAny = permissions.some((permission) =>
    hasPermission(userRole, permission)
  );

  if (!hasAny) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AllPermissionsGuardProps {
  userRole: UserRole;
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component guard that renders children only if user has all permissions
 */
export function AllPermissionsGuard({
  userRole,
  permissions,
  children,
  fallback = null,
}: AllPermissionsGuardProps) {
  const hasAll = permissions.every((permission) =>
    hasPermission(userRole, permission)
  );

  if (!hasAll) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  userRole: UserRole;
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component guard that renders children only if user has one of the allowed roles
 */
export function RoleGuard({
  userRole,
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check permissions (for conditional logic in components)
 */
export function useHasPermission(userRole: UserRole, permission: Permission): boolean {
  return hasPermission(userRole, permission);
}

/**
 * Hook to check if user has any of the permissions
 */
export function useHasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Hook to check if user has all permissions
 */
export function useHasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}
