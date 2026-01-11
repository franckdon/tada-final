// src/components/workspaces/create-workspace-dialog.tsx
"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/locales/client";
import { authClient } from "@/lib/auth-client";

import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import { X } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { slugify } from "@/lib/slugify";

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspace: { id: string; name: string; slug: string }) => void;
};

type SuggestedUser = {
  id: string;
  email: string;
  name?: string | null;
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceDialogProps) {
  const t = useI18n();
  const { data: organizations } = authClient.useListOrganizations();
  const orgId = organizations?.[0]?.id;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspaceDomain =
    process.env.NEXT_PUBLIC_WORKSPACE_DOMAIN || "tadaiq.com";

  // Auto-slug quand l’utilisateur tape le nom
  const handleNameChange = (value: string) => {
    setName(value);

    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(slugify(value));
    setSlugTouched(true);
  };

  const addEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return;
    if (invitedEmails.includes(trimmed)) return;
    setInvitedEmails((prev) => [...prev, trimmed]);
  };

  const handleEmailKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(emailInput);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const canSubmit = name.trim() && slug.trim() && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("slug", slug.trim());
      if (orgId) formData.append("organizationId", orgId);
      invitedEmails.forEach((email) =>
        formData.append("invitedEmails[]", email)
      );
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/workspaces", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.error("[CREATE_WORKSPACE] Failed", await res.text());
        setIsSubmitting(false);
        return;
      }

      const created = await res.json();
      onCreated?.({ id: created.id, name: created.name, slug: created.slug });

      // reset
      setName("");
      setSlug("");
      setLogoFile(null);
      setInvitedEmails([]);
      setEmailInput("");

      onOpenChange(false);
    } catch (error) {
      console.error("[CREATE_WORKSPACE] Error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-6">
        <DialogHeader>
          <DialogTitle>{t("navigation.createWorkspace")}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* LEFT : Workspace info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold">
                {t("workspace.informationTitle") || "Workspace Information"}
              </h3>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500">Logo</p>
              <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:bg-gray-50">
                <span className="mb-1 text-xl">＋</span>
                <span className="text-[11px] font-medium">Add Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </label>

              {logoPreview && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200 bg-white">
                    <img
                      src={logoPreview}
                      alt="Workspace logo preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {logoFile && (
                    <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                      {logoFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Workspace name */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                Workspace Name *
              </label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Tada"
                className="h-10 text-sm"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">URL *</label>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3">
                <span className="mr-2 text-gray-400">https://</span>
                <input
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="h-9 flex-1 border-none bg-transparent text-sm outline-none"
                  placeholder="my-workspace"
                />
                <span className="ml-2 text-xs text-gray-400">
                  .{workspaceDomain}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT : Invite colleagues */}
          <div className="space-y-4 rounded-lg bg-gray-50 p-4">
            <h3 className="text-sm font-semibold">
              {t("workspace.inviteTitle") ||
                "Invite your colleagues to this workspace"}
            </h3>

            {/* Email input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Email</label>
              <div className="flex gap-2">
                <Input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Invite by email"
                  className="h-10 text-sm"
                />
                <Button
                  type="button"
                  className="h-10"
                  onClick={() => {
                    addEmail(emailInput);
                    setEmailInput("");
                  }}
                >
                  Invite
                </Button>
              </div>
              <p className="text-[11px] text-gray-500">
                {t("workspace.inviteHint") ||
                  "Existing members will be added directly. New emails will receive an invitation email."}
              </p>
            </div>

            {/* Pills list */}
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg bg-white p-3">
              {invitedEmails.length === 0 && (
                <p className="text-xs text-gray-400">
                  No emails added yet. Start typing an email above and press
                  Enter.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {invitedEmails.map((email, index) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-w-[150px]"
          >
            {isSubmitting && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {t("workspace.saveButton") || "Save workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
