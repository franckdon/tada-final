"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@tada/ui/components/dialog";
import { Label } from "@tada/ui/components/label";
import { Switch } from "@tada/ui/components/switch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Badge } from "@tada/ui/components/badge";
import { Input } from "@tada/ui/components/input";
import { ScrollArea } from "@tada/ui/components/scroll-area";
import { Separator } from "@tada/ui/components/separator";
import { Globe, Lock, Plus, X, Users, Search, Loader2 } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Mission, OrganizationMember, User } from "./type";
import {
  getAvailableUsers,
  updateMissionPermissionsAction,
} from "@/actions/missions/mission-permission-action";
import { useI18n } from "@/locales/client";
import { useAction } from "next-safe-action/hooks";
import { useBoolean } from "@/hooks/use-boolean";
import { authClient } from "@/lib/auth-client";

interface MissionPermissionsModalProps {
  mission: Mission;
  orgId: string;
}

export default function MissionPermissionsModal({
  mission,
  orgId,
}: MissionPermissionsModalProps) {
  const t = useI18n();
  const visibilityModal = useBoolean();
  const [isPublic, setIsPublic] = useState(mission.isPublic);
  const [authorizedUsers, setAuthorizedUsers] = useState<OrganizationMember[]>(
    mission.missionPermissions?.map((item) => ({
      id: item.id,
      organizationId: orgId,
      role: item?.user?.role as any,
      createdAt: item.user?.createdAt,
      userId: item?.id,
      user: {
        name: item?.user.name,
        email: item?.user.email,
        image: item?.user.image || undefined,
      },
    }))
  );

  const [availableUsers, setAvailableUsers] = useState<OrganizationMember[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { toast } = useToast();

  // useEffect(() => {
  //   if (visibilityModal.value === true && availableUsers.length === 0) {
  //     setIsLoadingUsers(true);
  //     startTransition(async () => {
  //       try {
  //         const result = await getAvailableUsers();
  //         if (result) {
  //           setAvailableUsers(result?.data as any);
  //         } else {
  //           toast({
  //             title: t("common.error.somethingWentWrong"),
  //             description: t("missions.permissions.errors.loadUsers"),
  //             variant: "destructive",
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Erreur lors du chargement des utilisateurs:", error);
  //         toast({
  //           title: t("common.error.somethingWentWrong"),
  //           description: t("missions.permissions.errors.loadUsers"),
  //           variant: "destructive",
  //         });
  //       } finally {
  //         setIsLoadingUsers(false);
  //       }
  //     });
  //   }
  // }, [visibilityModal.value, availableUsers.length, toast, t]);

  useEffect(() => {
    const loadMembers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await authClient.organization.getFullOrganization({
          query: {
            organizationId: orgId,
          },
        });

        await authClient.organization.setActive({
          organizationId: orgId,
        });

        if (response.data?.members) {
          setAvailableUsers(response.data.members);
        }
        setIsLoadingUsers(false);
      } catch (error) {
        setIsLoadingUsers(false);
        console.error("Erreur lors du chargement des membres:", error);
      }
    };

    loadMembers();
  }, []);

  const updateMissionPermission = useAction(updateMissionPermissionsAction, {
    onSuccess: () => {
      visibilityModal?.onFalse();
      toast({
        title: t("missions.permissions.success"),
      });
    },
    onError: (error) => {
      toast({
        title: t("missions.permissions.errors.update"),
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMissionPermission.execute({
      missionId: mission?.id,
      isPublic: isPublic,
      authorizedUserIds: authorizedUsers.map((user) => user.id),
      orgId,
    });
  };

  const handleAddUser = (userId: string) => {
    const user = availableUsers.find((u) => u.id === userId);
    if (user && !authorizedUsers.find((u) => u.id === user.id)) {
      setAuthorizedUsers([...authorizedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setAuthorizedUsers(authorizedUsers.filter((u) => u.id !== userId));
  };

  const availableUsersFiltered = availableUsers.filter((member) => {
    const isNotAuthorized = !authorizedUsers.find((u) => u.id === member.id);
    const matchesSearch =
      searchQuery === "" ||
      member?.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member?.user?.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return isNotAuthorized && matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Obtenir les rôles uniques pour le filtre
  const uniqueRoles = [...new Set(availableUsers.map((user) => user.role))];

  return (
    <Dialog
      open={visibilityModal.value}
      onOpenChange={visibilityModal.onToggle}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {mission.isPublic ? (
            <>
              <Globe className="h-4 w-4" />
              {t("missions.permissions.visibility.public")}
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              {t("missions.permissions.visibility.private", {
                count: mission.missionPermissions?.length || 0,
              })}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("missions.permissions.title")}
          </DialogTitle>
          <DialogDescription>
            {t("missions.permissions.description", {
              missionName: mission.name,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {t("missions.permissions.visibility.label")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? t("missions.permissions.visibility.publicDescription")
                  : t("missions.permissions.visibility.privateDescription")}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Globe
                className={cn(
                  "h-4 w-4",
                  isPublic ? "text-green-600" : "text-muted-foreground"
                )}
              />
              <Switch
                checked={!isPublic}
                onCheckedChange={(checked) => setIsPublic(!checked)}
                disabled={isPending}
              />
              <Lock
                className={cn(
                  "h-4 w-4",
                  !isPublic ? "text-orange-600" : "text-muted-foreground"
                )}
              />
            </div>
          </div>

          <Separator />

          {!isPublic && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t("missions.permissions.authorizedUsers.label")}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  disabled={isLoadingUsers}
                >
                  {isLoadingUsers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {t("missions.permissions.authorizedUsers.add")}
                </Button>
              </div>

              {showUserSelector && (
                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t(
                          "missions.permissions.search.placeholder"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="all">
                        {t("missions.permissions.filters.allRoles")}
                      </option>
                      {uniqueRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUsers.length > 0 && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <span className="text-sm text-blue-800">
                        {t("missions.permissions.selection.count", {
                          count: selectedUsers.length,
                        })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            selectedUsers.forEach((userId) =>
                              handleAddUser(userId)
                            );
                            setSelectedUsers([]);
                          }}
                          className="h-7 px-3 text-xs"
                        >
                          {t("missions.permissions.selection.addAll")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUsers([])}
                          className="h-7 px-3 text-xs"
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-[150px]">
                    <div className="space-y-1">
                      {isLoadingUsers ? (
                        <div className="text-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {t("missions.permissions.loading.users")}
                          </p>
                        </div>
                      ) : availableUsersFiltered.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          {searchQuery || roleFilter !== "all"
                            ? t("missions.permissions.search.noResults")
                            : t("missions.permissions.search.allAdded")}
                        </div>
                      ) : (
                        availableUsersFiltered.map((member) => {
                          const isSelected = selectedUsers.includes(member.id);
                          return (
                            <div
                              key={member.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-blue-100 border border-blue-300"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                              onClick={() => {
                                handleAddUser(member.id);
                              }}
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 border-2 rounded flex items-center justify-center",
                                  isSelected
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-300"
                                )}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={member?.user.image || "/placeholder.svg"}
                                />
                                <AvatarFallback className="text-xs">
                                  {getInitials(member?.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {highlightText(
                                    member?.user.name,
                                    searchQuery
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {highlightText(
                                    member?.user.email,
                                    searchQuery
                                  )}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (
                          selectedUsers.length === availableUsersFiltered.length
                        ) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(
                            availableUsersFiltered.map((u) => u.id)
                          );
                        }
                      }}
                      disabled={
                        availableUsersFiltered.length === 0 || isLoadingUsers
                      }
                    >
                      {selectedUsers.length === availableUsersFiltered.length
                        ? t("missions.permissions.selection.deselectAll")
                        : t("missions.permissions.selection.selectAll")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowUserSelector(false);
                        setSearchQuery("");
                        setSelectedUsers([]);
                        setRoleFilter("all");
                      }}
                    >
                      {t("common.close")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Authorized Users List */}
              {authorizedUsers.length > 0 ? (
                <ScrollArea className="h-[200px] w-full border rounded-md p-3">
                  <div className="space-y-2">
                    {authorizedUsers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member?.user.image || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(member?.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member?.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {member?.user.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(member.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {t("missions.permissions.authorizedUsers.empty.title")}
                  </p>
                  <p className="text-xs">
                    {t(
                      "missions.permissions.authorizedUsers.empty.description"
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Public Access Info */}
          {isPublic && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {t("missions.permissions.publicInfo.title")}
                </p>
                <p className="text-xs text-green-600">
                  {t("missions.permissions.publicInfo.description")}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={visibilityModal.onFalse}
            disabled={updateMissionPermission.isExecuting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMissionPermission.isExecuting}
          >
            {updateMissionPermission.isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t("missions.permissions.saving")}
              </>
            ) : (
              t("missions.permissions.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
