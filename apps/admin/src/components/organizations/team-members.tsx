"use client";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { MembersManager } from "./members-manager";
import { useRouter } from "next/navigation";
import { UserPlus, Mail } from "lucide-react";
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
import { Label } from "@tada/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tada/ui/components/select";
import type React from "react";
import { type FormEvent, useState } from "react";

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
    banned?: boolean | null;
  };
}

const TeamMembersPreview = ({
  membersInitial,
  organizationName,
}: {
  membersInitial: TeamMember[];
  organizationName: string;
}) => {
  const t = useI18n();
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [members, setMembers] = useState<TeamMember[]>(membersInitial);
  const [isInviting, setIsInviting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await authClient.organization.inviteMember({
        email: inviteEmail,
        organizationId: members[0]?.organizationId,
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

  const handleUpdateRole = async () => {
    if (!editingMember || !newRole) return;

    setIsUpdating(true);
    try {
      await authClient.organization.updateMemberRole({
        memberId: editingMember.id,
        role: newRole as "admin" | "member" | "owner",
        organizationId: members[0]?.organizationId,
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

  const handleResetPassword = async () => {
    if (!editingMember) return;

    try {
      await Promise.all([
        authClient.admin.revokeUserSessions({
          userId: editingMember.userId,
        }),
        authClient.forgetPassword({
          email: editingMember.user.email,
        }),
      ]);

      toast({
        title: t("teamMembers.edit.resetPasswordSuccess"),
      });
    } catch (error) {
      toast({
        title: t("teamMembers.edit.resetPasswordError"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    await authClient.organization.removeMember({
      memberIdOrEmail: id,
      organizationId: members[0]?.organizationId,
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

  const handleSuspend = async () => {
    if (!editingMember) return;
    setIsLoading(true);
    try {
      if (editingMember?.user.banned && editingMember.user.banned === true) {
        await authClient.admin.unbanUser({
          userId: editingMember.id,
        });
        const updatedMembers = members.map((member) =>
          member.id === editingMember.id
            ? { ...member, user: { ...member.user, banned: false } }
            : member
        );
        setMembers(updatedMembers);
        toast({
          title: t("teamMembers.edit.success.unsuspend"),
        });
      } else {
        await Promise.all([
          authClient.admin.revokeUserSessions({
            userId: editingMember?.userId,
          }),
          authClient.admin.banUser({
            userId: editingMember?.userId,
            banReason: "Spamming",
          }),
        ]);
        const updatedMembers = members.map((member) =>
          member.id === editingMember.id
            ? { ...member, user: { ...member.user, banned: true } }
            : member
        );
        setMembers(updatedMembers);
        toast({
          title: t("teamMembers.edit.success.suspend"),
        });
      }
    } catch (error) {
      toast({
        title: editingMember?.user.banned
          ? t("teamMembers.edit.error.unsuspend")
          : t("teamMembers.edit.error.suspend"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEditingMember(null);
    }
  };

  const handleMemberAdded = () => {
    router.refresh();
  };

  return (
    <div className="p-5 text-gray-800 bg-white rounded-lg">
      {/* Section d'invitation */}
      <div className="mb-10 pb-8 border-b border-gray-200 grid grid-cols-1 2xl:grid-cols-[40%_60%] gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("teamMembers.invite.title")}
          </h2>
          <Button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un membre
          </Button>
        </div>

        <div className="w-full">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
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
            <Button className="flex gap-2" disabled={isInviting}>
              {isInviting ? (
                <>
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {t("teamMembers.invite.submit")}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Section des membres actuels */}
      <div className="grid grid-cols-1 2xl:grid-cols-[40%_60%] gap-4">
        <div className="mb-6 w-auto">
          <h2 className="text-lg font-semibold mb-1">
            {t("teamMembers.current.title")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("teamMembers.current.description")}
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
          <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
            <div className="col-span-5 p-4">
              {t("teamMembers.current.columns.name")}
            </div>
            <div className="col-span-2 p-4">
              {t("teamMembers.current.columns.role")}
            </div>
            <div className="col-span-4 p-4">
              {t("teamMembers.current.columns.actions")}
            </div>
          </div>

          <div>
            {members.map((member) => (
              <div
                key={member.id}
                className="grid grid-cols-12 border-b border-gray-200 bg-white items-center"
              >
                <div className="col-span-4 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
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
                    <div>
                      <div className="font-medium">{member.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 p-4 font-medium">
                  {t(`teamMembers.invite.roles.${member.role}`)}
                </div>
                <div className="col-span-5 p-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <span className="truncate">
                      {t("teamMembers.current.actions.edit")}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const impersonatedSession =
                        await authClient.admin.impersonateUser({
                          userId: member.userId,
                        });
                      window.open(
                        `http://localhost:3000/impersonate?token=${impersonatedSession.data?.session.token}`,
                        "_blank"
                      );
                      /* toast({
                        title: "Coming soon",
                        description: "This feature is not available yet",
                      }) */
                    }}
                  >
                    <span className="truncate">
                      {t("teamMembers.current.actions.login")}
                    </span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    <span className="truncate">
                      {t("teamMembers.current.actions.delete")}
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
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

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("teamMembers.edit.selectRolePlaceholder")}</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetPassword}>
                  {t("teamMembers.edit.resetPassword")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSuspend}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : editingMember?.user.banned ? (
                    t("teamMembers.edit.enableAccount")
                  ) : (
                    t("teamMembers.edit.disableAccount")
                  )}
                </Button>
              </div>
            </div>
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

      {/* Modal d'ajout de membre */}
      <MembersManager
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        organizationId={members[0]?.organizationId}
        organizationName={organizationName}
        onSuccess={handleMemberAdded}
      />
    </div>
  );
};

export default TeamMembersPreview;
