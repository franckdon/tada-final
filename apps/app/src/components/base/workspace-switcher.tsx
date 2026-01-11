// src/components/base/workspace-switcher.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useI18n, useCurrentLocale } from "@/locales/client";
import { useWorkspace } from "@/context/workspace-context";
import { Button } from "@tada/ui/components/button";
import { Plus, Settings as SettingsIcon, ChevronDown } from "lucide-react";
import { cn } from "@tada/ui/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { CreateWorkspaceDialog } from "@/components/workspaces/create-workspace-dialog";
import { getPublicUrlForPath } from "@/lib/uploads.public";

function WorkspaceAvatar({
  name,
  logo,
  className,
}: {
  name: string;
  logo?: string | null;
  className?: string;
}) {
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  const src = useMemo(() => {
    return getPublicUrlForPath({
      category: "workspaceLogo",
      pathOrUrl: logo,
    });
  }, [logo]);

  // ✅ Cache-busting : si le backend réécrit le même chemin, le navigateur ne gardera pas l'ancien
  const srcWithVersion = useMemo(() => {
    if (!src) return null;
    // Si logo = string path, on l'encode en "v", sinon fallback sur timestamp
    const v = logo ? encodeURIComponent(logo) : Date.now().toString();
    return `${src}${src.includes("?") ? "&" : "?"}v=${v}`;
  }, [src, logo]);

  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 overflow-hidden",
        className
      )}
    >
      {srcWithVersion ? (
        <img
          src={srcWithVersion}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "";
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

export function WorkspaceSwitcher() {
  const t = useI18n();
  const locale = useCurrentLocale();
  const pathname = usePathname();
  const router = useRouter();

  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspaceId,
    refresh,
    loading,
  } = useWorkspace();

  const [openCreate, setOpenCreate] = useState(false);
  const [openList, setOpenList] = useState(false);

  // Récupération éventuelle du workspaceId depuis l’URL
  const parts = pathname.split("/");
  let workspaceIdFromUrl: string | undefined;
  if (
    parts.length > 3 &&
    (parts[2] === "missions" || parts[2] === "market-beats")
  ) {
    workspaceIdFromUrl = parts[3];
  }

  useEffect(() => {
    if (!workspaces.length || !workspaceIdFromUrl) return;
    const exists = workspaces.find((w) => w.id === workspaceIdFromUrl);
    if (!exists) return;

    if (!currentWorkspace || currentWorkspace.id !== workspaceIdFromUrl) {
      setCurrentWorkspaceId(workspaceIdFromUrl);
    }
  }, [workspaces, workspaceIdFromUrl, currentWorkspace, setCurrentWorkspaceId]);

  const selectedId =
    currentWorkspace?.id ||
    workspaceIdFromUrl ||
    (workspaces[0] ? workspaces[0].id : "");

  const activeWorkspace = workspaces.find((w) => w.id === selectedId);

  const handleWorkspaceChange = (id: string) => {
    setCurrentWorkspaceId(id);
    router.push(`/${locale}/missions/${id}`);
    setOpenList(false);
  };

  const handleWorkspaceSettings = (id: string) => {
    router.push(`/${locale}/workspaces/${id}/settings`);
    setOpenList(false);
  };

  const handleCreated = async (workspace: {
    id: string;
    name: string;
    slug: string;
  }) => {
    await refresh();
    setCurrentWorkspaceId(workspace.id);
    router.push(`/${locale}/missions/${workspace.id}`);
    setOpenCreate(false);
    setOpenList(false);
  };

  return (
    <div className="px-4 mb-4">
      <button
        type="button"
        className={cn(
          "w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/60 px-3 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors",
          openList && "ring-1 ring-emerald-500/60"
        )}
        onClick={() => setOpenList((o) => !o)}
      >
        <div className="flex flex-col text-left">
          <div className="mt-1 flex items-center gap-2 max-w-[180px]">
            {activeWorkspace ? (
              <WorkspaceAvatar
                name={activeWorkspace.name}
                logo={activeWorkspace.logo}
              />
            ) : (
              <WorkspaceAvatar name="Tada" logo={null} />
            )}

            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {activeWorkspace?.name ||
                (loading ? t("common.loading") : t("navigation.workspace"))}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            openList && "rotate-180"
          )}
        />
      </button>

      {openList && (
        <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm max-h-72 overflow-y-auto">
          {workspaces.length > 0 ? (
            <div className="p-2 space-y-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => handleWorkspaceChange(ws.id)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-md px-2 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors",
                    selectedId === ws.id &&
                      "bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-500/60"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <WorkspaceAvatar name={ws.name} logo={ws.logo} />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {ws.name}
                      </span>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWorkspaceSettings(ws.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleWorkspaceSettings(ws.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 rounded-full p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity"
                    aria-label={
                      t("navigation.workspaceSettings") ?? "Workspace settings"
                    }
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                </button>
              ))}

              <div className="pt-2 mt-1 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-2 text-xs"
                  onClick={() => setOpenCreate(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t("navigation.createWorkspace")}
                </Button>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center gap-2 text-xs"
                  onClick={() => setOpenCreate(true)}
                >
                  <Plus className="h-4 w-4" />
                  {t("navigation.createWorkspace")}
                </Button>
              </div>
            )
          )}
        </div>
      )}

      <CreateWorkspaceDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreated={handleCreated}
      />
    </div>
  );
}
