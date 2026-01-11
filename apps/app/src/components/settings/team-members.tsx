"use client";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { updateOrganization } from "@/lib/update-organization";
import { useI18n } from "@/locales/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tada/ui/components/dialog";
import { Input } from "@tada/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import type React from "react";
import { type FormEvent, useEffect, useState, useTransition } from "react";

interface TeamMember {
  id: string;
  organizationId: string;
  createdAt: Date;
  role: "admin" | "member" | "owner";
  teamId?: string;
  userId: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
}

const TeamMembersPreview: React.FC = () => {
  const t = useI18n();
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isOrgSaving, setIsOrgSaving] = useState(false);
  const { toast } = useToast();
  const {
    data: organizations,
    isPending: isLoadingOrganizations,
    refetch,
  } = authClient.useListOrganizations();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [organizationName, setOrganizationName] = useState<string>(
    organizations?.[0]?.name || ""
  );
  const [isPending, startTransition] = useTransition();

  const { data: session } = authClient.useSession();

  const currentUserId = session?.user?.id;
  const currentMembership = members.find((m) => m.userId === currentUserId);

  const currentRole = currentMembership?.role;
  const canManageOrg = currentRole === "owner" || currentRole === "admin";

  // Charger les membres au montage du composant
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await authClient.organization.getFullOrganization({
          query: {
            organizationId: organizations?.[0]?.id,
          },
        });

        await authClient.organization.setActive({
          organizationId: organizations?.[0]?.id,
        });

        if (response.data?.members) {
          setMembers(response.data.members);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des membres:", error);
      }
    };
    if (!isLoadingOrganizations) {
      loadMembers();
    }
  }, [isLoadingOrganizations]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await authClient.organization.inviteMember({
        email: inviteEmail,
        organizationId: organizations?.[0]?.id,
        role: selectedRole as "admin" | "member" | "owner",
      });
      toast({
        title: t("teamMembers.invite.success.title"),
        description: t("teamMembers.invite.success.description", {
          email: inviteEmail,
        }),
      });
      setInviteEmail("");
    } catch (error) {
      toast({
        title: t("teamMembers.invite.error.title"),
        description: t("teamMembers.invite.error.description"),
        variant: "destructive",
      });
      console.error("Erreur lors de l'invitation:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await authClient.organization.removeMember({
      memberIdOrEmail: id,
      organizationId: organizations?.[0]?.id,
    });
    toast({
      title: t("teamMembers.invite.delete.title"),
      description: t("teamMembers.invite.delete.description"),
    });
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setNewRole(member.role);
  };

  const handleUpdateRole = async () => {
    if (!editingMember || !newRole) return;

    setIsUpdating(true);
    try {
      await authClient.organization.updateMemberRole({
        memberId: editingMember.id,
        role: newRole as "admin" | "member" | "owner",
        organizationId: organizations?.[0]?.id,
      });

      // Mettre à jour la liste des membres
      const updatedMembers = members.map((member) =>
        member.id === editingMember.id
          ? { ...member, role: newRole as "admin" | "member" | "owner" }
          : member
      );
      setMembers(updatedMembers);

      toast({
        title: t("teamMembers.edit.success.title"),
        description: t("teamMembers.edit.success.description", {
          name: editingMember.user.name,
          role: t(`teamMembers.invite.roles.${newRole}` as keyof typeof t),
        }),
      });

      setEditingMember(null);
    } catch (error) {
      toast({
        title: t("teamMembers.edit.error.title"),
        description: t("teamMembers.edit.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOrganizationChange = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOrgSaving(true);
    const form = e.currentTarget;
    const newName = form.organization.value.trim();

    const orgId = organizations?.[0]?.id;

    if (!canManageOrg) {
      toast({
        title: "Accès refusé",
        description: "Seuls les admins/owners peuvent modifier l’organisation.",
        variant: "destructive",
      });
      return;
    }

    if (!orgId) {
      toast({
        title: t("teamMembers.organization.edit.missingId"),
        variant: "destructive",
      });
      setIsOrgSaving(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateOrganization(orgId, newName);

        toast({
          title: t("teamMembers.organization.edit.success.title"),
          description: t("teamMembers.organization.edit.success.description", {
            name: organizations?.[0]?.name,
            newName: result?.name,
          }),
        });

        refetch();

        setIsOrgSaving(false);
      } catch (err) {
        setIsOrgSaving(false);

        toast({
          title: t("teamMembers.organization.edit.error.title"),
          description: t("teamMembers.organization.edit.error.description"),
          variant: "destructive",
        });
      }
    });
  };

  console.log("Rendering TeamMembersPreview with members:", members);
  return (
    <div className="p-5 text-gray-800">
      {/* Section d'invitation */}
      <div className="mb-10 pb-8 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="text-lg font-semibold mb-5">
          {t("teamMembers.invite.title")}
        </h2>

        <div className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ✉️
              </span>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t("teamMembers.invite.emailPlaceholder")}
                className="w-full pl-10 pr-3 py-2 "
                required
              />
            </div>

            <div className="min-w-32">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("teamMembers.invite.selectRolePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    {t("teamMembers.invite.roles.owner")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("teamMembers.invite.roles.admin")}
                  </SelectItem>
                  <SelectItem value="member">
                    {t("teamMembers.invite.roles.viewer")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="flex gap-2"
              disabled={isInviting || !canManageOrg}
            >
              {isInviting ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <span>✉️</span>
                  {t("teamMembers.invite.submit")}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Section des membres actuels */}
      <div className="border-b border-gray-200 pb-8">
        {/* Titre + description en haut */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">
            {t("teamMembers.current.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("teamMembers.current.description")}
          </p>
        </div>

        {/* Carte/tableau des membres en dessous */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header de la carte */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              {t("teamMembers.current.title")}
            </h3>
            <span className="text-xs text-gray-500">
              {members.length} {t("teamMembers.current.membersCountLabel")}
            </span>
          </div>

          {members.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-500">
              {t("teamMembers.current.empty")}
            </div>
          ) : (
            <div className="min-w-full overflow-x-auto">
              {/* En-têtes */}
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-50">
                <div>{t("teamMembers.current.columns.name")}</div>
                <div>{t("teamMembers.current.columns.role")}</div>
                <div className="text-right">
                  {t("teamMembers.current.columns.actions")}
                </div>
              </div>

              {/* Lignes membres */}
              <div className="divide-y divide-gray-100">
                {members.map((member) => {
                  const isSelf = member.userId === currentUserId;
                  const isOwner = member.role === "owner";
                  const disableDelete = !canManageOrg || isOwner;
                  const disableEdit = !canManageOrg || isOwner;
                  return (
                    <div
                      key={member.id}
                      className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)] px-6 py-3 items-center hover:bg-gray-50 transition-colors"
                    >
                      {/* Nom + email */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={member.user.image}
                            alt={`Avatar de ${member.user.name}`}
                          />
                          <AvatarFallback>
                            {member.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {member.user.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {member.user.email}
                          </div>
                        </div>
                      </div>

                      {/* Rôle */}
                      <div className="text-sm font-medium text-gray-700">
                        {t(`teamMembers.invite.roles.${member.role}`)}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={disableDelete}
                          className={`h-8 px-3 text-xs font-medium border rounded-full ${
                            disableDelete
                              ? "text-gray-400 border-gray-200 cursor-not-allowed"
                              : "text-red-600 border-red-200 hover:bg-red-50"
                          }`}
                          onClick={() => handleDelete(member.id)}
                        >
                          {t("teamMembers.current.actions.delete")}
                        </button>
                        <button
                          type="button"
                          disabled={disableEdit}
                          className={`h-8 px-3 text-xs font-medium border rounded-full ${
                            disableEdit
                              ? "text-gray-400 border-gray-200 cursor-not-allowed"
                              : "text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleEdit(member)}
                        >
                          {t("teamMembers.current.actions.edit")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section organisations*/}
      <div className="grid grid-cols-1 mt-10 border-t border-gray-50 md:grid-cols-2 gap-4">
        <div className="mb-6 w-auto">
          <h2 className="text-lg font-semibold mb-1">
            {t("teamMembers.organization.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("teamMembers.organization.description")}
          </p>
        </div>

        <div className="w-full">
          <form
            onSubmit={handleOrganizationChange}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-grow">
              <Input
                type="text"
                name="organization"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t("teamMembers.organization.namePlaceholder")}
                className="w-full px-3 py-2 "
                required
              />
            </div>

            <Button
              className="flex gap-2"
              disabled={isOrgSaving || !canManageOrg}
            >
              {isOrgSaving ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>{t("teamMembers.organization.submit")}</>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Modal d'édition */}
      <Dialog
        open={!!editingMember}
        onOpenChange={() => setEditingMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("teamMembers.edit.title", {
                name: editingMember?.user.name,
              })}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage
                  src={editingMember?.user.image}
                  alt={`Avatar de ${editingMember?.user.name}`}
                />
                <AvatarFallback>
                  {editingMember?.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{editingMember?.user.name}</div>
                <div className="text-sm text-gray-500">
                  {editingMember?.user.email}
                </div>
              </div>
            </div>

            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("teamMembers.edit.selectRolePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">
                  {t("teamMembers.invite.roles.owner")}
                </SelectItem>
                <SelectItem value="admin">
                  {t("teamMembers.invite.roles.admin")}
                </SelectItem>
                <SelectItem value="member">
                  {t("teamMembers.invite.roles.member")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingMember(null)}
              disabled={isUpdating}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMembersPreview;
