/**
 * Middleware and utilities for permission checking in API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { hasPermission, type Permission, type UserRole } from "./roles";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

/**
 * Check if the current user has required permission
 * Returns error response if unauthorized
 */
export function requirePermission(
  userRole: UserRole,
  permission: Permission
): NextResponse | null {
  if (!hasPermission(userRole, permission)) {
    return NextResponse.json(
      {
        success: false,
        error: "Insufficient permissions",
        message: `This action requires the '${permission}' permission`,
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if user has any of the required permissions
 */
export function requireAnyPermission(
  userRole: UserRole,
  permissions: Permission[]
): NextResponse | null {
  const hasAny = permissions.some((permission) =>
    hasPermission(userRole, permission)
  );

  if (!hasAny) {
    return NextResponse.json(
      {
        success: false,
        error: "Insufficient permissions",
        message: `This action requires one of: ${permissions.join(", ")}`,
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if user has all of the required permissions
 */
export function requireAllPermissions(
  userRole: UserRole,
  permissions: Permission[]
): NextResponse | null {
  const hasAll = permissions.every((permission) =>
    hasPermission(userRole, permission)
  );

  if (!hasAll) {
    return NextResponse.json(
      {
        success: false,
        error: "Insufficient permissions",
        message: `This action requires all of: ${permissions.join(", ")}`,
      },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Decorator function to protect API routes with permission checks
 * Usage in API route:
 * 
 * export const GET = withPermission(
 *   PERMISSIONS.USERS_READ,
 *   async (req, context) => {
 *     // Your handler code
 *   }
 * );
 */
export function withPermission(
  permission: Permission,
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest, context?: any) => {
    // Check if user is authenticated
    if (!req.user || !req.user.role) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check permission
    const permissionError = requirePermission(req.user.role, permission);
    if (permissionError) {
      return permissionError;
    }

    // Execute handler
    return handler(req, context);
  };
}

/**
 * Helper to extract user from request (mock for now, integrate with your auth)
 */
export async function getUserFromRequest(
  req: NextRequest
): Promise<{ id: string; email: string; role: UserRole; name: string } | null> {
  // TODO: Integrate with your actual authentication system
  // This is a placeholder - replace with your auth logic
  
  // For now, check headers or cookies
  const authHeader = req.headers.get("authorization");
  const userHeader = req.headers.get("x-user-role");
  
  if (userHeader) {
    // Mock user from header (for testing)
    return {
      id: "mock-user-id",
      email: "admin@example.com",
      role: userHeader as UserRole,
      name: "Mock User",
    };
  }
  
  // In production, decode JWT token, verify session, etc.
  return null;
}

/**
 * Response helpers
 */
export const apiResponse = {
  success: <T>(data: T, message?: string) => {
    return NextResponse.json({
      success: true,
      data,
      ...(message && { message }),
    });
  },

  error: (error: string, message?: string, status: number = 400) => {
    return NextResponse.json(
      {
        success: false,
        error,
        ...(message && { message }),
      },
      { status }
    );
  },

  unauthorized: (message: string = "Authentication required") => {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message,
      },
      { status: 401 }
    );
  },

  forbidden: (message: string = "Insufficient permissions") => {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message,
      },
      { status: 403 }
    );
  },

  notFound: (message: string = "Resource not found") => {
    return NextResponse.json(
      {
        success: false,
        error: "Not Found",
        message,
      },
      { status: 404 }
    );
  },
};
