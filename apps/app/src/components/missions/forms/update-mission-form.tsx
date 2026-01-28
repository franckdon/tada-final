"use client";

import { submitMissionForValidationAction } from "@/actions/missions/submit-mission-for-validation.action";
import { generateMissionBriefAIAction } from "@/actions/missions/generate-mission-brief-ai";
import { Icons } from "@/components/icons";
import { AudiencesFilterModal } from "@/components/missions/modals/audiences-filter-modal";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { FormControl, FormField, FormItem } from "@tada/ui/components/form";
import { cn } from "@tada/ui/lib/utils";
import type { Mission, TempMission } from "@prisma/client";
import { useThread } from "@assistant-ui/react";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Section {
  id: number;
  key: string;
  title: string;
  content: string;
  status: "pending" | "completed";
  color: string;
  placeholder?: string;
  selectedMarkets?: string[];
}

type WorkspaceCtx = {
  id: string;
  organizationStatus: string | null;
};

type ThreadMessage = {
  role: "user" | "assistant" | string;
  content?: Array<{ type: string; text?: string }>;
  id?: string;
  messageId?: string;
};

const extractTextFromMessage = (msg: any): string => {
  const c = msg?.content;
  if (!c) return "";
  if (typeof c === "string") return c;

  if (Array.isArray(c)) {
    return c
      .map((part: any) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (part.type === "text") {
          if (typeof part.text === "string") return part.text;
          if (typeof part.text?.value === "string") return part.text.value;
        }
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

function buildTranscript(messages: readonly ThreadMessage[]) {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const txt = extractTextFromMessage(m).trim();
      if (!txt) return null;
      return `${m.role.toUpperCase()}: ${txt}`;
    })
    .filter((x): x is string => Boolean(x))
    .join("\n\n");
}

function renderBulletedList(text: string): JSX.Element {
  if (!text) return <></>;

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length <= 1) {
    const one = rawLines[0] ?? "";
    return <span>{one.endsWith(".") ? one : one + "."}</span>;
  }

  const items = rawLines.map((line) =>
    line
      .replace(/^[-*•●]\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim(),
  );

  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, idx) => (
        <li key={idx}>{item.endsWith(".") ? item : item + "."}</li>
      ))}
    </ul>
  );
}

export function UpdateMissionForm({
  locale,
  workspace,
  canEdit,
  originalMissionId,
  inComingMission,
  orgId,
  currentUserId,
}: {
  locale: string;
  workspace: WorkspaceCtx;
  canEdit: boolean;
  inComingMission: Mission | TempMission;
  originalMissionId: string;
  orgId: string;
  currentUserId?: string | null;
}) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const form = useFormContext();

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const isAiMode = mode === "ai";

  const editSectionRef = useRef<HTMLDivElement>(null);
  const editTitleRef = useRef<HTMLDivElement>(null);

  const [isAudiencesFilterModalOpen, setIsAudiencesFilterModalOpen] =
    useState(false);

  const [title, setTitle] = useState(
    (inComingMission as any)?.name || t("missions.createMission.form.name"),
  );
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [tempContent, setTempContent] = useState("");

  const [lastSyncedAssistantId, setLastSyncedAssistantId] = useState<
    string | null
  >(null);

  const {
    activeFiltersCount,
    selectedFilters,
    filterGroups,
    handleOptionSelect,
    suggestions,
    removeSuggestion,
  } = useAudiencesFilter();

  const updateMission = useAction(submitMissionForValidationAction, {
    onSuccess: ({ data }) => {
      toast({
        title: t("missions.surveys.edited"),
        description: data?.message,
      });
    },
    onError: ({ error }) => {
      console.log("update mission error", error);
      toast({
        title: t("missions.update.genericError"),
        variant: "destructive",
      });
    },
  });

  const generateBrief = useAction(generateMissionBriefAIAction, {
    onSuccess: (res) => {
      const brief = res.data?.data;
      if (!brief) return;

      form.setValue("name", brief.name, { shouldDirty: true });
      form.setValue("problemSummary", brief.problemSummary, {
        shouldDirty: true,
      });
      form.setValue("objectives", brief.objectives, { shouldDirty: true });
      form.setValue("assumptions", brief.assumptions, { shouldDirty: true });

      if (typeof brief.sampleSummary === "string") {
        form.setValue("sampleSummary", brief.sampleSummary, {
          shouldDirty: true,
        });
      }
      if (typeof brief.preliminaryRecommendations === "string") {
        form.setValue(
          "preliminaryRecommendations",
          brief.preliminaryRecommendations,
          { shouldDirty: true },
        );
      }
      if (typeof brief.studyStructure === "string") {
        form.setValue("studyStructure", brief.studyStructure, {
          shouldDirty: true,
        });
      }

      // sync sections UI
      setSections((prev) =>
        prev.map((s) => {
          if (["problemSummary", "objectives", "assumptions"].includes(s.key)) {
            const v = (form.getValues(s.key as any) as string) ?? "";
            return { ...s, content: v, status: v ? "completed" : "pending" };
          }
          return s;
        }),
      );

      toast({
        title:
          locale === "fr"
            ? "Brief mis à jour automatiquement"
            : "Brief updated automatically",
        description:
          locale === "fr"
            ? "Tu peux encore l’éditer avant de sauvegarder."
            : "You can still edit it before saving.",
      });
    },
    onError: () => {
      toast({
        title: t("common.error.somethingWentWrong"),
        description:
          locale === "fr"
            ? "Impossible de générer le brief depuis la conversation. Réessaie."
            : "Could not generate the brief from the conversation. Try again.",
        variant: "destructive",
      });
    },
  });

  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      key: "problemSummary",
      title: t("missions.createMission.form.problemSummary"),
      content: (inComingMission as any)?.problemSummary || "",
      status: (inComingMission as any)?.problemSummary
        ? "completed"
        : "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 2,
      key: "objectives",
      title: t("missions.createMission.form.strategicGoal"),
      content: (inComingMission as any)?.objectives || "",
      status: (inComingMission as any)?.objectives ? "completed" : "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 3,
      key: "assumptions",
      title: t("missions.createMission.form.assumptions"),
      content: (inComingMission as any)?.assumptions || "",
      status: (inComingMission as any)?.assumptions ? "completed" : "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 4,
      key: "audiences",
      title: t("missions.createMission.form.audiences"),
      content: "",
      selectedMarkets: ["UK", "USA"],
      status: activeFiltersCount > 0 ? "completed" : "pending",
      placeholder: t("missions.createMission.form.targetPlaceholder"),
      color: "gray",
    },
  ]);

  const showLockedToast = () => {
    toast({
      title: locale === "fr" ? "Mission verrouillée" : "Mission locked",
      description:
        locale === "fr"
          ? "Impossible de modifier une mission quand son statut est Live ou Complétée. Repasse-la en Draft ou On hold."
          : "You can't edit a mission when it's Live or Completed. Set it back to Draft or On hold.",
      variant: "destructive",
    });
  };

  const startEditingTitle = () => {
    if (!canEdit) return showLockedToast();
    setEditingTitle(true);
    setTempTitle(title);
  };

  const saveTitleChanges = () => {
    if (!canEdit) return;
    if (tempTitle.trim()) setTitle(tempTitle.trim());
    setEditingTitle(false);
  };

  const startEditingContent = (id: number) => {
    if (!canEdit) return showLockedToast();
    const section = sections.find((s) => s.id === id);
    setEditingSection(id);
    setTempContent(section?.content || "");
  };

  const saveContentChanges = () => {
    if (!canEdit) return;
    if (!editingSection) return;

    setSections((prev) =>
      prev.map((section) =>
        section.id === editingSection
          ? {
              ...section,
              content: tempContent,
              status: tempContent ? "completed" : "pending",
            }
          : section,
      ),
    );

    setEditingSection(null);
  };

  const onSubmit = async (values: any) => {
    if (!canEdit) {
      showLockedToast();
      return;
    }

    updateMission.execute({
      missionId: originalMissionId,
      workspaceId: workspace.id,
      status: "on hold",
      name: values?.name,
      problemSummary: values?.problemSummary,
      objectives: values?.objectives,
      assumptions: values?.assumptions,

      // ✅ audiences viennent du contexte (pré-remplies via AudiencesFilterProvider audiences=...)
      audiences: selectedFilters,

      // ✅ optionnel: si ton action/schema supporte
      // suggestions,
    } as any);
  };

  // assistant thread
  const thread = useThread();
  const threadMessages = (thread?.messages ?? []) as readonly ThreadMessage[];

  const lastAssistant = useMemo(() => {
    return [...threadMessages].reverse().find((m) => m.role === "assistant");
  }, [threadMessages]);

  const lastAssistantText = useMemo(() => {
    return lastAssistant ? extractTextFromMessage(lastAssistant) : "";
  }, [lastAssistant]);

  useEffect(() => {
    const log = (...args: any[]) => console.log("[AI FILL UPDATE]", ...args);

    if (!isAiMode) return log("skip: not AI mode");
    if (!threadMessages.length) return log("skip: no thread messages yet");
    if (!canEdit) return log("skip: mission locked");

    const READY_RE = /\[\[READY_TO_FILL_FORM\]\]/i;
    const CONFIRM_RE =
      /\b(yes|yeah|yep|ok|okay|sure|confirmed|go ahead|do it|sounds good|looks good|oui|d['’]accord|ok|vas-y|c['’]est bon|parfait)\b/i;

    // 1) last assistant with READY
    let askedIndex = -1;
    for (let i = threadMessages.length - 1; i >= 0; i--) {
      const msg = threadMessages[i];
      if (msg.role !== "assistant") continue;
      const text = extractTextFromMessage(msg);
      if (READY_RE.test(text)) {
        askedIndex = i;
        break;
      }
    }
    if (askedIndex === -1) return log("skip: READY token not found");

    // 2) user confirmation after
    const after = threadMessages.slice(askedIndex + 1);
    const confirmMsg = after.find((m) => {
      if (m.role !== "user") return false;
      const userText = extractTextFromMessage(m).trim();
      return CONFIRM_RE.test(userText);
    });
    if (!confirmMsg) return log("skip: no user confirmation after READY");

    const assistantMsg = threadMessages[askedIndex];
    const assistantId =
      (assistantMsg as any).id ??
      (assistantMsg as any).messageId ??
      `assistant-${askedIndex}`;

    if (assistantId === lastSyncedAssistantId) {
      return log("already synced for assistantId:", assistantId);
    }

    if (generateBrief.status === "executing") return log("skip: executing");

    setLastSyncedAssistantId(assistantId);

    toast({
      title: locale === "fr" ? "Mise à jour du brief…" : "Updating the brief…",
      description:
        locale === "fr"
          ? "Je remplis automatiquement le formulaire à partir de la conversation."
          : "I'm filling the form from the conversation.",
    });

    const transcript = buildTranscript(threadMessages);

    generateBrief.execute({
      locale,
      transcript,
      currentBrief: {
        name: form.getValues("name"),
        problemSummary: form.getValues("problemSummary"),
        objectives: form.getValues("objectives"),
        assumptions: form.getValues("assumptions"),
        sampleSummary: form.getValues("sampleSummary"),
        preliminaryRecommendations: form.getValues(
          "preliminaryRecommendations",
        ),
        studyStructure: form.getValues("studyStructure"),
      },
      audiences: selectedFilters,
    });
  }, [
    isAiMode,
    canEdit,
    threadMessages,
    lastSyncedAssistantId,
    generateBrief.status,
    locale,
    toast,
    form,
    selectedFilters,
  ]);

  // click outside - section
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editingSection &&
        editSectionRef.current &&
        !editSectionRef.current.contains(event.target as Node)
      ) {
        saveContentChanges();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSection, tempContent, canEdit]);

  // click outside - title
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editingTitle &&
        editTitleRef.current &&
        !editTitleRef.current.contains(event.target as Node)
      ) {
        saveTitleChanges();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTitle, tempTitle, canEdit]);

  // sync sections with form values
  useEffect(() => {
    const subscription = form.watch((values: any) => {
      if (values?.name) setTitle(values.name);

      setSections((prev) =>
        prev.map((section) => {
          const v = values?.[section.key];
          if (typeof v === "string") {
            return {
              ...section,
              content: v,
              status: v ? "completed" : "pending",
            };
          }
          return section;
        }),
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // audiences section status (count inclut suggestions)
  useEffect(() => {
    const hasAnyAudiences = activeFiltersCount > 0;
    setSections((prev) =>
      prev.map((s) =>
        s.key === "audiences"
          ? { ...s, status: hasAnyAudiences ? "completed" : "pending" }
          : s,
      ),
    );
  }, [activeFiltersCount]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="min-h-screen bg-white dark:bg-gray-900 p-4"
    >
      {!canEdit && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          {locale === "fr"
            ? "Cette mission est verrouillée (Live/Complétée). Tu ne peux pas la modifier."
            : "This mission is locked (Live/Completed). You can't edit it."}
        </div>
      )}

      {generateBrief.status === "executing" && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <Icons.spinner className="h-4 w-4 animate-spin" />
          <span>
            {locale === "fr"
              ? "Brief en cours de génération à partir de la conversation…"
              : "Generating the brief from the conversation…"}
          </span>
        </div>
      )}

      <div className="flex justify-between items-center gap-2 mb-6">
        <div className="flex flex-col w-full">
          {editingTitle ? (
            <div ref={editTitleRef}>
              <FormField
                control={form.control}
                defaultValue={tempTitle}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        className="w-full text-black dark:text-white p-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        rows={2}
                        {...field}
                        disabled={!canEdit}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setTitle(e.target.value);
                          setTempTitle(e.target.value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setEditingTitle(false)}
                  className="text-black dark:text-white"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  type="button"
                  disabled={!canEdit}
                  onClick={() => {
                    if (!canEdit) return showLockedToast();
                    setTitle(form.getValues("name"));
                    setEditingTitle(false);
                  }}
                >
                  {t("common.save")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-8 items-center">
              <h1 className="text-xl font-semibold text-black dark:text-white transition-colors border-b border-transparent hover:border-gray-600 inline-block">
                {title}
              </h1>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={startEditingTitle}
                  className={cn(!canEdit && "opacity-50")}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="lg"
          type="button"
          onClick={() => router.back()}
          className="text-black dark:text-white"
        >
          {t("common.cancel")}
        </Button>

        <Button variant="default" size="lg" type="submit" disabled={!canEdit}>
          {updateMission.status === "executing" ? (
            <Icons.spinner className="w-4 h-4 animate-spin" />
          ) : (
            t("common.save")
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.key}
            className="bg-[#FFD3CE] dark:bg-gray-900 border border-[#FFD3CE] rounded-md p-4"
          >
            <div className="flex items-center mb-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full mr-3",
                  section.status === "pending"
                    ? "bg-yellow-400"
                    : "bg-green-500",
                )}
              />

              <h2 className="text-black dark:text-white font-bold text-lg flex-grow">
                {section.title}
              </h2>

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => startEditingContent(section.id)}
                className={cn(!canEdit && "opacity-50 cursor-not-allowed")}
                disabled={!canEdit}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <div className="ml-6">
              {section.id === 4 ? (
                <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
                  <p className="text-sm text-black/80 dark:text-white/80">
                    {section.placeholder}
                  </p>

                  <Button
                    size="lg"
                    className={cn("w-full", !canEdit && "opacity-50")}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => {
                      if (!canEdit) return showLockedToast();
                      setIsAudiencesFilterModalOpen(true);
                    }}
                  >
                    {t("missions.createMission.form.filterAudiences")}{" "}
                    {activeFiltersCount > 0 && (
                      <span className="text-sm text-gray-400">
                        ({activeFiltersCount})
                      </span>
                    )}
                  </Button>

                  {(activeFiltersCount > 0 || suggestions.length > 0) && (
                    <div className="mt-2">
                      <div className="flow-root">
                        <div className="-mx-2 -my-1 flex flex-wrap">
                          {Object.keys(selectedFilters).map((groupId) =>
                            Object.keys(selectedFilters[groupId] || {}).flatMap(
                              (filterId) => {
                                const group = filterGroups.find(
                                  (g) => g.id === groupId,
                                );
                                const filter = group?.filters.find(
                                  (f) => f.id === filterId,
                                );

                                const values =
                                  (selectedFilters[groupId]?.[filterId] as
                                    | string[]
                                    | undefined) ?? [];

                                return values.map((value) => {
                                  const option = filter?.options?.find(
                                    (o) => o.value === value,
                                  );

                                  return (
                                    <span
                                      key={`${groupId}-${filterId}-${value}`}
                                      className="m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-1 text-sm font-medium text-gray-900"
                                    >
                                      <span>
                                        {filter?.label}:{" "}
                                        {option?.label || value}
                                      </span>

                                      <button
                                        type="button"
                                        className={cn(
                                          "ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500",
                                          !canEdit && "cursor-not-allowed",
                                        )}
                                        disabled={!canEdit}
                                        onClick={() => {
                                          if (!canEdit)
                                            return showLockedToast();
                                          handleOptionSelect(
                                            groupId,
                                            filterId,
                                            value,
                                            false,
                                          );
                                        }}
                                      >
                                        <span className="sr-only">
                                          Retirer {filter?.label}{" "}
                                          {option?.label || value}
                                        </span>
                                        <svg
                                          className="h-2 w-2"
                                          stroke="currentColor"
                                          fill="none"
                                          viewBox="0 0 8 8"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeWidth="1.5"
                                            d="M1 1l6 6m0-6L1 7"
                                          />
                                        </svg>
                                      </button>
                                    </span>
                                  );
                                });
                              },
                            ),
                          )}
                        </div>

                        {suggestions.length > 0 && (
                          <>
                            <div className="my-2 w-full">
                              <div className="h-px w-full bg-gray-200" />
                              <p className="mt-2 text-xs text-gray-500">
                                {locale === "fr"
                                  ? "Suggestions"
                                  : "Suggestions"}
                              </p>
                            </div>

                            {suggestions.map((s, idx) => (
                              <span
                                key={`${s.groupId ?? "none"}-${s.label}-${idx}`}
                                className="m-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 py-1.5 pl-3 pr-1 text-sm font-medium text-amber-900"
                                title={s.description ?? ""}
                              >
                                <span>
                                  {s.groupId
                                    ? `${filterGroups.find((g) => g.id === s.groupId)?.label ?? s.groupId}: `
                                    : ""}
                                  {s.label}
                                </span>

                                <button
                                  type="button"
                                  className={cn(
                                    "ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-amber-700 hover:bg-amber-100",
                                    !canEdit && "cursor-not-allowed",
                                  )}
                                  disabled={!canEdit}
                                  onClick={() => {
                                    if (!canEdit) return showLockedToast();
                                    removeSuggestion(idx);
                                  }}
                                >
                                  <span className="sr-only">
                                    {locale === "fr"
                                      ? "Retirer la suggestion"
                                      : "Remove suggestion"}
                                  </span>
                                  <svg
                                    className="h-2 w-2"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 8 8"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeWidth="1.5"
                                      d="M1 1l6 6m0-6L1 7"
                                    />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : editingSection === section.id ? (
                <div ref={editSectionRef} className="w-full">
                  <FormField
                    control={form.control}
                    defaultValue={tempContent}
                    name={section.key as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <textarea
                            className="w-full text-black dark:text-white p-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                            rows={4}
                            {...field}
                            disabled={!canEdit}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setTempContent(e.target.value);
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setEditingSection(null)}
                      className="text-black dark:text-white"
                    >
                      {t("common.cancel")}
                    </Button>

                    <Button
                      size="sm"
                      type="button"
                      disabled={!canEdit}
                      onClick={() => {
                        if (!canEdit) return showLockedToast();
                        form.setValue(section.key as any, tempContent, {
                          shouldDirty: true,
                        });
                        saveContentChanges();
                      }}
                    >
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "text-black dark:text-white hover:bg-opacity-30 p-2 rounded-md transition-colors text-left w-full",
                    !canEdit && "cursor-not-allowed opacity-80",
                  )}
                  onClick={() => startEditingContent(section.id)}
                >
                  {section.content
                    ? renderBulletedList(section.content)
                    : section.placeholder}
                </button>
              )}
            </div>
          </div>
        ))}

        {workspace.organizationStatus === "active" && (
          <div className="bg-[#FFD3CE] dark:bg-gray-900 border border-[#FFD3CE] rounded-md p-4">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 rounded-full mr-3 bg-yellow-400" />
              <h2 className="text-black dark:text-white font-bold text-lg flex-grow">
                {t("missions.createMission.form.surveys")}
              </h2>

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  router.push(
                    `/${locale}/missions/${workspace.id}/${originalMissionId}/surveys`,
                  );
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full"
              type="button"
              onClick={() => {
                router.push(
                  `/${locale}/missions/${workspace.id}/${originalMissionId}/surveys`,
                );
              }}
            >
              {t("missions.createMission.form.showSurveys")}
            </Button>
          </div>
        )}
      </div>

      <AudiencesFilterModal
        isOpen={isAudiencesFilterModalOpen}
        onOpenChange={setIsAudiencesFilterModalOpen}
        orgId={orgId}
        missionId={originalMissionId}
        currentUserId={currentUserId}
      />
    </form>
  );
}
