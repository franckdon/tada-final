"use client";

import { ADMIN_SUB_ROLES, ADMIN_SUB_ROLE_METADATA, type AdminSubRole } from "@/lib/rbac/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import { Label } from "@tada/ui/components/label";
import { Shield, Settings, Users, CheckCircle, DollarSign, FileSearch } from "lucide-react";

interface AdminSubRoleSelectorProps {
  value?: AdminSubRole | null;
  onChange: (value: AdminSubRole | null) => void;
  label?: string;
  disabled?: boolean;
}

const iconMap = {
  Shield: Shield,
  Settings: Settings,
  Users: Users,
  CheckCircle: CheckCircle,
  DollarSign: DollarSign,
  FileSearch: FileSearch,
};

export function AdminSubRoleSelector({
  value,
  onChange,
  label = "Sous-rôle Administrateur",
  disabled = false,
}: AdminSubRoleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val as AdminSubRole)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un sous-rôle..." />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ADMIN_SUB_ROLES).map((subRole) => {
            const metadata = ADMIN_SUB_ROLE_METADATA[subRole];
            const IconComponent = iconMap[metadata.icon as keyof typeof iconMap];
            
            return (
              <SelectItem key={subRole} value={subRole}>
                <div className="flex items-center gap-2">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  <div className="flex flex-col">
                    <span className="font-medium">{metadata.label}</span>
                    <span className="text-xs text-gray-500">{metadata.description}</span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Équipe concernée : </span>
            {ADMIN_SUB_ROLE_METADATA[value].team}
          </p>
        </div>
      )}
    </div>
  );
}
