"use client";

import { updateOrganizationAction } from "@/actions/organizations/update-organization-action";
import { Icons } from "@/components/icons";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Button } from "@tada/ui/components/button";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { EditableField } from "./editable-field";
import { EditableTitle } from "./editable-title";
import type { Organization } from "./type";

interface OrganizationStats {
  label: string;
  value: string;
}

interface OrganizationMetadata {
  country?: string;
  email?: string;
  [key: string]: string | number | undefined;
}

interface ProfileCardProps {
  organization: Organization & {
    stats: OrganizationStats[];
    metadata: OrganizationMetadata;
  };
}

const ProfileCard = ({ organization }: ProfileCardProps) => {
  const t = useI18n();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(organization.status);

  const updateOrganization = useAction(updateOrganizationAction, {
    onSuccess: () => {
      toast({
        title: t("common.notifications.success.save"),
      });
    },
    onError: () => {
      toast({ title: t("common.notifications.error.save") });
    },
  });
  return (
    <div className="w-full max-w-md rounded-lg border border-gray-100 bg-white shadow-sm">
      {/* Section avatar et infos personnelles */}
      <div className="flex flex-col items-center p-6 pb-0">
        <Avatar className="mr-3">
          {organization.logo && (
            <AvatarImage src={organization.logo} alt="User avatar" />
          )}
          <AvatarFallback>
            {organization.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <EditableTitle
          field="name"
          value={organization.name}
          defaultValue={organization.name}
          editingField={editingField}
          setEditingField={setEditingField}
          setEditValue={setEditValue}
          editValue={editValue}
          onUpdateMetadata={async (field, value) => {
            await updateOrganization.executeAsync({
              [field]: value,
              id: organization.id,
            });
            return;
          }}
        />
        <p className="mt-1 mb-6 text-lg text-gray-500">{organization.slug}</p>
      </div>

      {/* Section statistiques */}
      <div className="divide-y">
        <EditableField
          field="country"
          value={organization.metadata.country}
          defaultValue="Côte d'Ivoire"
          editingField={editingField}
          setEditingField={setEditingField}
          setEditValue={setEditValue}
          editValue={editValue}
          onUpdateMetadata={async (field, value) => {
            await updateOrganization.executeAsync({
              metadata: {
                ...(organization.metadata as Record<string, string>),
                [field]: value,
              },
              id: organization.id,
            });
            return;
          }}
        />
        <EditableField
          field="email"
          value={organization.metadata.email}
          defaultValue="info@example.com"
          editingField={editingField}
          setEditingField={setEditingField}
          setEditValue={setEditValue}
          editValue={editValue}
          onUpdateMetadata={async (field, value) => {
            await updateOrganization.executeAsync({
              metadata: {
                ...(organization.metadata as Record<string, string>),
                [field]: value,
              },
              id: organization.id,
            });
            return;
          }}
        />
        {organization.stats.map((stat, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className="flex items-center justify-between px-6 py-4"
          >
            <span className="text-gray-700">{stat.label}</span>
            <span className="font-medium text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="p-6">
        <Button
          className="w-full"
          variant="default"
          onClick={async () => {
            setIsLoading(true);
            setStatus(status === "active" ? "inactive" : "active");
            await updateOrganization.executeAsync({
              status: status === "active" ? "inactive" : "active",
              id: organization.id,
            });
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {status === "active"
                ? t("organizations.detail.actions.loading.unsuspend")
                : t("organizations.detail.actions.loading.suspend")}
            </>
          ) : status === "inactive" ? (
            t("organizations.detail.actions.unsuspend")
          ) : (
            t("organizations.detail.actions.suspend")
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
