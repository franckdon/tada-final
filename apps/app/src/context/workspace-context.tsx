"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Workspace = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  organizationId?: string | null;
};

type WorkspacePatch = Partial<Pick<Workspace, "name" | "slug" | "logo">>;

type WorkspaceContextValue = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspaceId: (id: string) => void;
  refresh: () => Promise<void>;
  patchWorkspaceInState: (id: string, patch: WorkspacePatch) => void;
  loading: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "tada-current-workspace-id";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch workspaces
   */
  const fetchWorkspaces = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (!res.ok) {
        console.error("Failed to fetch workspaces");
        setWorkspaces([]);
        return;
      }

      const data: Workspace[] = await res.json();
      setWorkspaces(data || []);

      // 1️⃣ priorité : URL
      let nextId: string | null = null;

      const parts = pathname?.split("/").filter(Boolean) ?? [];
      if (
        parts.length >= 3 &&
        (parts[1] === "missions" || parts[1] === "market-beats")
      ) {
        nextId = parts[2];
      }

      // 2️⃣ sinon localStorage
      if (!nextId && typeof window !== "undefined") {
        nextId = window.localStorage.getItem(STORAGE_KEY);
      }

      // 3️⃣ sinon premier workspace
      if (!nextId && data.length > 0) {
        nextId = data[0].id;
      }

      if (nextId) {
        setCurrentWorkspaceIdState(nextId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, nextId);
        }
      }
    } catch (e) {
      console.error("[WORKSPACES_FETCH_ERROR]", e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial fetch
   */
  useEffect(() => {
    void fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 🔑 Synchronisation URL → currentWorkspaceId
   * (corrige définitivement les bugs de solde et de switch)
   */
  useEffect(() => {
    if (!pathname || !workspaces.length) return;

    const parts = pathname.split("/").filter(Boolean);

    let workspaceIdFromUrl: string | null = null;
    if (
      parts.length >= 3 &&
      (parts[1] === "missions" || parts[1] === "market-beats")
    ) {
      workspaceIdFromUrl = parts[2];
    }

    if (!workspaceIdFromUrl) return;

    const exists = workspaces.some((w) => w.id === workspaceIdFromUrl);
    if (!exists) return;

    if (currentWorkspaceId !== workspaceIdFromUrl) {
      setCurrentWorkspaceIdState(workspaceIdFromUrl);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, workspaceIdFromUrl);
      }
    }
  }, [pathname, workspaces, currentWorkspaceId]);

  /**
   * Setter explicite (ex: depuis UI)
   */
  const setCurrentWorkspaceId = (id: string) => {
    setCurrentWorkspaceIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  /**
   * Patch local workspace
   */
  const patchWorkspaceInState = (id: string, patch: WorkspacePatch) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    );
  };

  /**
   * Workspace courant
   */
  const currentWorkspace = useMemo(() => {
    return workspaces.find((w) => w.id === currentWorkspaceId) || null;
  }, [workspaces, currentWorkspaceId]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspaceId,
        refresh: fetchWorkspaces,
        patchWorkspaceInState,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
