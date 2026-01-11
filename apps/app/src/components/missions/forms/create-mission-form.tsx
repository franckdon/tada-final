import { createMissionAction } from "@/actions/missions/create-mission-action";
import { generateMissionBriefAIAction } from "@/actions/missions/generate-mission-brief-ai";
import { createMissionSchema } from "@/actions/missions/schema";
import { Icons } from "@/components/icons";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { FormControl, FormField, FormItem } from "@tada/ui/components/form";
import { useThread } from "@assistant-ui/react";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AudiencesFilterModal } from "../modals/audiences-filter-modal";
import { Input } from "@tada/ui/components/input";

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
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length <= 1) {
    return <p className="whitespace-pre-line text-left">{rawLines[0] ?? ""}</p>;
  }

  const items = rawLines.map((line) =>
    line
      .replace(/^[-*•●]\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim()
  );

  return (
    <ul className="list-disc pl-5 space-y-1 text-left">
      {items.map((item, idx) => (
        <li key={idx}>{item.endsWith(".") ? item : item + "."}</li>
      ))}
    </ul>
  );
}

export function CreateMissionForm({
  organization,
  workspaceId,
  locale,
}: {
  organization: { status: string | null; id: string };
  workspaceId: string;
  locale: string;
}) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const form = useFormContext();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("t");
  const mode = searchParams.get("mode");
  const isAiMode = mode === "ai";

  const editSectionRef = useRef<HTMLDivElement>(null);
  const editTitleRef = useRef<HTMLDivElement>(null);

  const [isAudiencesFilterModalOpen, setIsAudiencesFilterModalOpen] =
    useState(false);

  const [title, setTitle] = useState(t("missions.createMission.form.name"));
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

  const createMission = useAction(createMissionAction, {
    onSuccess: (data) => {
      toast({ title: t("missions.createMission.form.success") });
      const mission = data.data?.data;
      if (mission) {
        router.push(`/${locale}/missions/${workspaceId}/${mission.id}/surveys`);
      }
    },
    onError: () => {
      toast({
        title: t("missions.createMission.form.error"),
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

      form.setValue("sampleSummary", brief.sampleSummary, {
        shouldDirty: true,
      });
      form.setValue("targetSampleSize", brief.targetSampleSize ?? undefined, {
        shouldDirty: true,
      });
      form.setValue(
        "preliminaryRecommendations",
        brief.preliminaryRecommendations,
        {
          shouldDirty: true,
        }
      );
      form.setValue("studyStructure", brief.studyStructure, {
        shouldDirty: true,
      });

      setSections((prev) =>
        prev.map((s) => {
          if (["problemSummary", "objectives", "assumptions"].includes(s.key)) {
            const v = (form.getValues(s.key) as string) ?? "";
            return { ...s, content: v, status: v ? "completed" : "pending" };
          }
          return s;
        })
      );

      toast({
        title: t("missions.createMission.form.aiBriefFilled"),
        description:
          "Le brief complet a été rempli automatiquement. Tu peux encore l’éditer avant de sauvegarder.",
      });
    },
    onError: () => {
      toast({
        title: t("common.error.somethingWentWrong"),
        description:
          "Impossible de générer le plan complet de l’étude. Réessaie dans un instant.",
        variant: "destructive",
      });
    },
  });

  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      key: "problemSummary",
      title: t("missions.createMission.form.problemSummary"),
      content: "",
      status: "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 2,
      key: "objectives",
      title: t("missions.createMission.form.strategicGoal"),
      content: "",
      status: "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 3,
      key: "assumptions",
      title: t("missions.createMission.form.assumptions"),
      content: "",
      status: "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 4,
      key: "audiences",
      title: t("missions.createMission.form.audiences"),
      content: "",
      selectedMarkets: ["UK", "USA"],
      status: "pending",
      placeholder: t("missions.createMission.form.targetPlaceholder"),
      color: "gray",
    },
  ]);

  const startEditingTitle = () => {
    setEditingTitle(true);
    setTempTitle(title);
  };

  const saveTitleChanges = () => {
    if (tempTitle.trim()) setTitle(tempTitle.trim());
    setEditingTitle(false);
  };

  const startEditingContent = (id: number) => {
    const section = sections.find((s) => s.id === id);
    setEditingSection(id);
    setTempContent(section?.content || "");
  };

  const saveContentChanges = () => {
    if (!editingSection) return;

    setSections((prev) =>
      prev.map((section) =>
        section.id === editingSection
          ? {
              ...section,
              content: tempContent,
              status: tempContent ? "completed" : "pending",
            }
          : section
      )
    );

    setEditingSection(null);
  };

  const onSubmit = async (values: object) => {
    createMission.execute(
      createMissionSchema.parse({
        ...values,
        workspaceId,
        organizationId: organization.id,
        audiences: selectedFilters,
        templateId,
        mode,
      })
    );
  };

  // Thread assistant-ui
  const thread = useThread();
  const threadMessages = (thread?.messages ?? []) as readonly ThreadMessage[];

  const lastAssistant = useMemo(() => {
    return [...threadMessages].reverse().find((m) => m.role === "assistant");
  }, [threadMessages]);

  const lastAssistantText = useMemo(() => {
    return lastAssistant ? extractTextFromMessage(lastAssistant) : "";
  }, [lastAssistant]);

  /**
   * AI FILL trigger:
   * - Primary: token [[READY_TO_FILL_FORM]]
   * - Fallback: assistant message looks like a "brief" and is long enough
   * - (Optionnel) Confirmation user: gardée uniquement si tu veux, sinon tu peux la retirer
   */
  useEffect(() => {
    const log = (...args: any[]) => console.log("[AI FILL]", ...args);

    if (!isAiMode) return log("skip: not AI mode");
    if (!threadMessages.length) return log("skip: no thread messages yet");

    const READY_RE = /\[\[READY_TO_FILL_FORM\]\]/i;

    const CONFIRM_RE =
      /\b(yes|yeah|yep|ok|okay|sure|confirmed|go ahead|do it|sounds good|looks good|oui|d['’]accord|ok|vas-y|c['’]est bon|parfait)\b/i;

    // 1) Trouver le DERNIER message assistant avec le token READY
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

    // 2) Chercher une confirmation USER après ce message
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

    const transcript = buildTranscript(threadMessages);

    setLastSyncedAssistantId(assistantId);

    toast({
      title:
        locale === "fr"
          ? "Génération du brief en cours…"
          : "Generating the brief…",
      description:
        locale === "fr"
          ? "Je remplis automatiquement le formulaire à partir de la conversation."
          : "I'm filling the form from the conversation.",
    });

    generateBrief.execute({
      locale,
      transcript,
      currentBrief: {
        name: form.getValues("name"),
        problemSummary: form.getValues("problemSummary"),
        objectives: form.getValues("objectives"),
        assumptions: form.getValues("assumptions"),
        sampleSummary: form.getValues("sampleSummary"),
        targetSampleSize: form.getValues("targetSampleSize"),
        preliminaryRecommendations: form.getValues(
          "preliminaryRecommendations"
        ),
        studyStructure: form.getValues("studyStructure"),
      },
      audiences: selectedFilters,
    });
  }, [
    isAiMode,
    threadMessages,
    lastSyncedAssistantId,
    generateBrief.status,
    locale,
    toast,
    form,
    selectedFilters,
  ]);

  // Click outside: section edit
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
  }, [editingSection, tempContent]);

  // Click outside: title edit
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
  }, [editingTitle, tempTitle]);

  // Sync title + section statuses with form values
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
        })
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Audiences section status
  useEffect(() => {
    const hasAnyAudiences = activeFiltersCount > 0 || suggestions.length > 0;
    setSections((prev) =>
      prev.map((s) =>
        s.key === "audiences"
          ? { ...s, status: hasAnyAudiences ? "completed" : "pending" }
          : s
      )
    );
  }, [activeFiltersCount, suggestions.length]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="h-full flex flex-col bg-white dark:bg-gray-900 p-4"
    >
      <input type="hidden" {...form.register("hidden")} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 flex-col">
          {editingTitle ? (
            <div ref={editTitleRef} className="mb-2">
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

              <div className="flex mt-2 space-x-2">
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
                  onClick={() => {
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
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            {t("missions.createMission.form.researchMarket")}
          </span>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Button variant="default" size="lg" type="submit">
            {createMission.status === "executing" ? (
              <Icons.spinner className="w-4 h-4 animate-spin" />
            ) : (
              t("common.save")
            )}
          </Button>
        </div>
      </div>

      {generateBrief.status === "executing" && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <Icons.spinner className="h-4 w-4 animate-spin" />
          <span>
            {t("missions.createMission.form.aiBriefGenerating") ??
              (locale === "fr"
                ? "Brief en cours de génération à partir de la conversation…"
                : "Generating the brief from the conversation…")}
          </span>
        </div>
      )}

      <div className="space-y-6 w-full">
        {sections.map((section) => (
          <div
            key={section.key}
            className="bg-[#FFD3CE] dark:bg-gray-900 border border-[#FFD3CE] rounded-md p-4"
          >
            <div className="flex items-center mb-3">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  section.status === "pending"
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />

              <h2 className="text-black dark:text-white font-bold text-lg flex-grow">
                {section.title}
              </h2>

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => startEditingContent(section.id)}
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
                    className="w-full"
                    type="button"
                    onClick={() => setIsAudiencesFilterModalOpen(true)}
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
                            Object.keys(selectedFilters[groupId] || {}).map(
                              (filterId) => {
                                const group = filterGroups.find(
                                  (g) => g.id === groupId
                                );
                                const filter = group?.filters.find(
                                  (f) => f.id === filterId
                                );

                                return (
                                  selectedFilters[groupId]?.[filterId] as
                                    | string[]
                                    | undefined
                                )?.map((value) => {
                                  const option = filter?.options?.find(
                                    (o) => o.value === value
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
                                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                                        onClick={() =>
                                          handleOptionSelect(
                                            groupId,
                                            filterId,
                                            value,
                                            false
                                          )
                                        }
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
                              }
                            )
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
                                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 rounded-full p-1 text-amber-700 hover:bg-amber-100"
                                  onClick={() => removeSuggestion(idx)}
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
                    name={section.key}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <textarea
                            className="w-full text-black dark:text-white p-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                            rows={4}
                            {...field}
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
                      onClick={() => {
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
                  className="text-black dark:text-white hover:bg-opacity-30 p-2 rounded-md transition-colors text-left w-full"
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
      </div>

      {/* Target sample size */}
      <div className="bg-[#FFD3CE] dark:bg-gray-900 border border-[#FFD3CE] rounded-md p-4 pt-10 mt-6">
        <div className="flex items-center mb-3">
          <div className="w-3 h-3 rounded-full mr-3 bg-yellow-400" />
          <h2 className="text-black dark:text-white font-bold text-lg flex-grow">
            {t("missions.createMission.form.sampleSizeTitle", {
              defaultValue:
                locale === "fr" ? "Taille d’échantillon" : "Sample size",
            })}
          </h2>
        </div>

        <div className="ml-6">
          <FormField
            control={form.control}
            name="targetSampleSize"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-wrap items-center gap-2 text-black dark:text-white">
                    <span className="text-sm">
                      {t("missions.createMission.form.iWantToSurvey", {
                        defaultValue:
                          locale === "fr"
                            ? "Je veux interroger"
                            : "I want to survey",
                      })}
                    </span>

                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      className="w-28 bg-white dark:bg-gray-800 text-black dark:text-white"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        field.onChange(v === "" ? undefined : Number(v));
                      }}
                      placeholder="0"
                    />

                    <span className="text-sm">
                      {t("missions.createMission.form.participants", {
                        defaultValue:
                          locale === "fr" ? "participants" : "participants",
                      })}
                    </span>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <p className="mt-2 text-xs text-black/70 dark:text-white/70">
            {t("missions.createMission.form.sampleSizeHint", {
              defaultValue:
                locale === "fr"
                  ? "Optionnel. L’IA peut proposer une valeur, mais tu peux la modifier."
                  : "Optional. AI may suggest a value, but you can adjust it.",
            })}
          </p>
        </div>
      </div>

      <AudiencesFilterModal
        isOpen={isAudiencesFilterModalOpen}
        onOpenChange={() => setIsAudiencesFilterModalOpen(false)}
        orgId={organization.id}
        missionId={undefined}
        currentUserId={undefined}
      />
    </form>
  );
}
