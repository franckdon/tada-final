"use client";

import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { organization } from "@/lib/auth-client";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { Card, CardContent } from "@tada/ui/components/card";
import { Input } from "@tada/ui/components/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrganizationSetup() {
  const t = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");

  const [workspaceName, setWorkspaceName] = useState(
    t("workspace.defaultName") ?? "Mon premier workspace"
  );

  const createNewOrganization = async () => {
    setIsLoading(true);
    try {
      let slug = `${organizationName}-${Math.random()
        .toString(36)
        .substring(2, 15)}`
        .toLowerCase()
        .replace(/ /g, "-");

      let result = await organization.checkSlug({ slug });

      while (!result.data?.status) {
        slug = `${organizationName}-${Math.random()
          .toString(36)
          .substring(2, 15)}`
          .toLowerCase()
          .replace(/ /g, "-");

        result = await organization.checkSlug({ slug });
      }

      const res = await organization.create({
        name: organizationName,
        slug,
        logo: "",
      });

      if (res.error || !res.data) {
        console.error("ORGANIZATION_CREATE_ERROR", res.error);
        throw new Error(res.error?.message ?? "Organization creation failed");
      }

      const org = res.data;

      // on prend la valeur du formulaire, avec fallback au cas où
      const defaultWorkspaceName =
        workspaceName || t("workspace.defaultName") || "Mon premier workspace";

      await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: defaultWorkspaceName,
          organizationId: org.id,
        }),
      });

      toast({
        title: t("organization.created.title"),
        description: t("organization.created.description"),
      });

      router.push("/");
    } catch (error) {
      console.error("ORG_SETUP_ERROR", error);
      toast({
        title: t("organization.error.title"),
        description: t("organization.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinWithInvitation = () => {
    toast({
      title: t("organization.join.title"),
      description: t("organization.join.needInvitation"),
      duration: 5000,
    });
    router.push("/");
  };

  return (
    <Card className="shadow-none max-w-2xl mx-auto mt-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("organization.setup.title")}
        </h2>
        <p className="text-gray-600 mb-8">
          {t("organization.setup.description")}
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("organization.setup.create.title")}
            </h3>
            <div className="space-y-4">
              <Input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder={t("organization.setup.create.namePlaceholder")}
              />

              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder={
                  t("workspace.defaultNamePlaceholder") ?? "Nom du workspace"
                }
              />
              {/* éventuellement un petit helper text */}
              <p className="text-xs text-muted-foreground">
                {t("workspace.helper") ??
                  "Ce sera votre premier espace de travail."}
              </p>
              <Button
                onClick={createNewOrganization}
                disabled={isLoading || !organizationName}
                className="w-full"
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  t("organization.setup.create.submit")
                )}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("common.or")}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("organization.setup.join.title")}
            </h3>
            <Button
              variant="outline"
              onClick={joinWithInvitation}
              className="w-full"
            >
              {t("organization.setup.join.submit")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
