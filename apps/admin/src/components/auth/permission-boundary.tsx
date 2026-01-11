import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac/check-permission";
import {
  type Permission,
  type UserRole,
  type AdminSubRole,
  hasEffectivePermission,
} from "@/lib/rbac/roles";

interface PermissionBoundaryProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
  children: React.ReactNode;
}

/**
 * Server-side permission boundary component
 * Use this in server components to protect content based on permissions
 */
export async function PermissionBoundary({
  permission,
  permissions = [],
  requireAll = true,
  fallback = null,
  redirectTo,
  children,
}: PermissionBoundaryProps) {
  const user = await getCurrentUser();

  if (!user || user.banned) {
    if (redirectTo) {
      redirect(redirectTo);
    }
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasEffectivePermission(
      user.role as UserRole,
      permission,
      user.adminSubRole as AdminSubRole | null
    );
  } else if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every((perm) =>
        hasEffectivePermission(
          user.role as UserRole,
          perm,
          user.adminSubRole as AdminSubRole | null
        )
      );
    } else {
      hasAccess = permissions.some((perm) =>
        hasEffectivePermission(
          user.role as UserRole,
          perm,
          user.adminSubRole as AdminSubRole | null
        )
      );
    }
  }

  if (!hasAccess) {
    if (redirectTo) {
      redirect(redirectTo);
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Unauthorized access message component
 */
export function UnauthorizedMessage({
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Accès non autorisé
        </h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}