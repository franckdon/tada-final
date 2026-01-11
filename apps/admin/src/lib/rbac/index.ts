/**
 * RBAC (Role-Based Access Control) System
 * 
 * Central export point for all RBAC functionality
 */

export {
  USER_ROLES,
  MEMBER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  MEMBER_ROLE_PERMISSIONS,
  ROLE_METADATA,
  MEMBER_ROLE_METADATA,
  hasPermission,
  hasMemberPermission,
  getUserPermissions,
  getMemberPermissions,
  isValidUserRole,
  isValidMemberRole,
  getCombinedPermissions,
  type UserRole,
  type MemberRole,
  type Permission,
} from "./roles";

export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  withPermission,
  getUserFromRequest,
  apiResponse,
  type AuthenticatedRequest,
} from "./middleware";

export {
  PermissionGuard,
  AnyPermissionGuard,
  AllPermissionsGuard,
  RoleGuard,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
} from "./guards";
