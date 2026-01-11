/**
 * Validations et types pour la gestion des utilisateurs
 */

import { USER_ROLES, isValidUserRole, type UserRole } from "@/lib/rbac/roles";

export const KYC_STATUSES = {
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELED: "canceled",
} as const;

export type KycStatus = typeof KYC_STATUSES[keyof typeof KYC_STATUSES];

// Re-export for convenience
export { USER_ROLES, isValidUserRole, type UserRole };

export interface CreateUserInput {
  email: string;
  name: string;
  role?: UserRole;
  adminSubRole?: string | null;
  position?: string | null;
  country?: string | null;
  sector?: string | null;
  image?: string | null;
  kyc_status?: KycStatus | null;
  job?: string | null;
  location?: string | null;
  banned?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: UserRole;
  adminSubRole?: string | null;
  position?: string | null;
  country?: string | null;
  sector?: string | null;
  image?: string | null;
  kyc_status?: KycStatus | null;
  job?: string | null;
  location?: string | null;
  banned?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
  banned?: boolean;
  kyc_status?: KycStatus;
  page?: number;
  limit?: number;
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// isValidRole is now imported as isValidUserRole from @/lib/rbac/roles
// Keep this alias for backward compatibility
export const isValidRole = isValidUserRole;

/**
 * Valide un statut KYC
 */
export function isValidKycStatus(status: string): status is KycStatus {
  return Object.values(KYC_STATUSES).includes(status as KycStatus);
}

/**
 * Valide les données de création d'un utilisateur
 */
export function validateCreateUser(data: any): {
  valid: boolean;
  errors: string[];
  data?: CreateUserInput;
} {
  const errors: string[] = [];
  
  // Validation des champs requis
  if (!data.email) {
    errors.push("Email is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }
  
  if (!data.name) {
    errors.push("Name is required");
  } else if (data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  // Validation du rôle
  if (data.role && !isValidRole(data.role)) {
    errors.push(`Invalid role. Must be one of: ${Object.values(USER_ROLES).join(", ")}`);
  }
  
  // Validation adminSubRole si fourni
  if (data.adminSubRole && typeof data.adminSubRole !== "string") {
    errors.push("Invalid adminSubRole format");
  }

  // Validation du statut KYC
  if (data.kyc_status && !isValidKycStatus(data.kyc_status)) {
    errors.push(`Invalid KYC status. Must be one of: ${Object.values(KYC_STATUSES).join(", ")}`);
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    data: {
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      role: data.role || USER_ROLES.CONTRIBUTOR,
      adminSubRole: data.adminSubRole || null,
      position: data.position || null,
      country: data.country || null,
      sector: data.sector || null,
      image: data.image || null,
      kyc_status: data.kyc_status || null,
      job: data.job || null,
      location: data.location || null,
      banned: data.banned || false,
    },
  };
}

/**
 * Valide les données de mise à jour d'un utilisateur
 */
export function validateUpdateUser(data: any): {
  valid: boolean;
  errors: string[];
  data?: UpdateUserInput;
} {
  const errors: string[] = [];
  const updateData: UpdateUserInput = {};
  
  // Validation de l'email si fourni
  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      errors.push("Invalid email format");
    } else {
      updateData.email = data.email.toLowerCase().trim();
    }
  }
  
  // Validation du nom si fourni
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else {
      updateData.name = data.name.trim();
    }
  }
  
  // Validation du rôle si fourni
  // if (data.role !== undefined) {
  //   if (!isValidRole(data.role)) {
  //     errors.push(`Invalid role. Must be one of: ${Object.values(USER_ROLES).join(", ")}`);
  //   } else {
  //     updateData.role = data.role;
  //   }
  // }
  
  if (data.adminSubRole !== undefined) {
    updateData.adminSubRole = data.adminSubRole || null;
  }
  
  // Validation du statut KYC si fourni
  if (data.kyc_status !== undefined) {
    if (data.kyc_status !== null && !isValidKycStatus(data.kyc_status)) {
      errors.push(`Invalid KYC status. Must be one of: ${Object.values(KYC_STATUSES).join(", ")}`);
    } else {
      updateData.kyc_status = data.kyc_status;
    }
  }
  
  // Autres champs optionnels
  if (data.position !== undefined) updateData.position = data.position;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.sector !== undefined) updateData.sector = data.sector;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.job !== undefined) updateData.job = data.job;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.banned !== undefined) updateData.banned = Boolean(data.banned);
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    errors: [],
    data: updateData,
  };
}
