"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { USER_ROLES, ROLE_METADATA, type UserRole } from "@/lib/rbac/roles";
import { Shield, UserCog, Users, CheckCircle } from "lucide-react";

interface RoleSelectorProps {
  value: UserRole;
  onValueChange: (value: UserRole) => void;
  disabled?: boolean;
  className?: string;
}

const ICON_MAP = {
  Shield: Shield,
  UserCog: UserCog,
  Users: Users,
  CheckCircle: CheckCircle,
};

export function RoleSelector({
  value,
  onValueChange,
  disabled = false,
  className,
}: RoleSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sélectionner un rôle" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(USER_ROLES).map((role) => {
          const metadata = ROLE_METADATA[role];
          const IconComponent = ICON_MAP[metadata.icon as keyof typeof ICON_MAP];
          
          return (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <div>
                  <div className="font-medium">{metadata.label}</div>
                  <div className="text-xs text-gray-500">{metadata.description}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
