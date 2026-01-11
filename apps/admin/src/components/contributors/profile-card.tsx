"use client";

import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@tada/ui/components/avatar";
import { Button } from "@tada/ui/components/button";
import React, { useState } from "react";
import type { Contributor } from "./type";
import Link from "next/link";
import {
  Edit,
} from "lucide-react";

const ProfileCard = ({
  contributor,
}: {
  contributor: Contributor & { stats: { label: string; value: string }[] };
}) => {
  const t = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(contributor.banned);

  const handleSuspend = async () => {
    setIsLoading(true);
    try {
      if (contributor.banned && contributor.banned === true) {
        await authClient.admin.unbanUser({
          userId: contributor.id,
        });
        toast({
          title: t("contributors.detail.actions.success.unsuspend"),
        });
        setIsBanned(false);
      } else {
        await Promise.all([
          authClient.admin.revokeUserSessions({
            userId: contributor.id,
          }),
          authClient.admin.banUser({
            userId: contributor.id,
            banReason: "Spamming",
          }),
        ]);
        setIsBanned(true);
        toast({
          title: t("contributors.detail.actions.success.suspend"),
        });
      }
    } catch (error) {
      toast({
        title: contributor.banned
          ? t("contributors.detail.actions.error.unsuspend")
          : t("contributors.detail.actions.error.suspend"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-100 bg-white shadow-sm">
      {/* Section avatar et infos personnelles */}
      <div className="flex flex-col items-center p-6 pb-0">
        <Avatar className="mr-3">
          {contributor.image && (
            <AvatarImage src={contributor.image} alt="User avatar" />
          )}
          <AvatarFallback>
            {contributor.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h2 className="mt-4 text-2xl font-medium text-gray-800">
          {contributor.name}
        </h2>
        <p className="mt-1 mb-6 text-lg text-gray-500">{contributor.job}</p>
      </div>

      {/* Section statistiques */}
      <div className="divide-y">
        {contributor.stats.map((stat, index) => (
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

      {/* Section bouton */}
      <div className="p-6">
        <Button
          className="w-full"
          variant="default"
        >
          <Link
            href={`/contributors/edit/${contributor.id}`}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4 text-white" />
            {t("contributors.detail.actions.edit")}
          </Link>
        </Button>
        {/* <Button
          className="w-full"
          variant="default"
          onClick={() => handleSuspend()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              {isBanned
                ? t("contributors.detail.actions.loading.unsuspend")
                : t("contributors.detail.actions.loading.suspend")}
            </>
          ) : isBanned ? (
            t("contributors.detail.actions.unsuspend")
          ) : (
            t("contributors.detail.actions.suspend")
          )}
        </Button> */}
      </div>
    </div>
  );
};

export default ProfileCard;
