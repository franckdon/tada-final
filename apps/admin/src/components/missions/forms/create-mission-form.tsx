"use client";

import { createMissionAction } from "@/actions/missions/create-mission-action";
import { createMissionSchema } from "@/actions/missions/schema";
import { Icons } from "@/components/icons";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { FormControl, FormField, FormItem } from "@tada/ui/components/form";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
// 🚨 CORRECTION 1 : Importer 'useCallback'
import { useEffect, useRef, useState, useCallback } from "react"; 
import { useFormContext } from "react-hook-form";
import { AudiencesFilterModal } from "../modals/audiences-filter-modal";
import type { Mission } from "../type";

interface Section {
  id: number;
  key: string;
  title: string;
  content: string;
  status: string;
  color: string;
  placeholder?: string;
  selectedMarkets?: string[];
}

// 🚨 CORRECTION 4 (Option A) : Définition de la fonction de rendu (ou utiliser useCallback à l'intérieur)

export function CreateMissionForm() {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const form = useFormContext();
  const editSectionRef = useRef<HTMLDivElement>(null);
  const editTitleRef = useRef<HTMLDivElement>(null);
  const [isAudiencesFilterModalOpen, setIsAudiencesFilterModalOpen] =
    useState(false);
  const [title, setTitle] = useState(t("missions.createMission.form.name"));
  const [editingTitle, setEditingTitle] = useState(false);
  const searchParams = useSearchParams();
  const templateId = searchParams.get("t");
  const mode = searchParams.get("mode");

  const [tempTitle, setTempTitle] = useState("");
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [tempContent, setTempContent] = useState("");
  const {
    activeFiltersCount,
    selectedFilters,
    filterGroups,
    handleOptionSelect,
  } = useAudiencesFilter();
  
  // 🚨 CORRECTION 2 : Déplacer la déclaration de l'état 'sections' ici (plus haut)
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
      color: "gray",
    },
  ]);

  // 🚨 CORRECTION 4 (Option B) : Redéfinir renderBulletedList avec useCallback
  const renderBulletedList = useCallback((text: string): JSX.Element => {
    if (!text) return <></>;
    const items = text
      .split(/\n|\. /)
      .map((item) => item.trim())
      .filter(Boolean);

    if (items.length > 1)
      return (
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, idx) => (
            <li key={idx}>{item.endsWith(".") ? item : item + "."}</li>
          ))}
        </ul>
      );

    return <span>{items[0]?.endsWith(".") ? items[0] : items[0] + "."}</span>;
  }, []);

  const saveTitleChanges = useCallback(() => {
    const newTitle = form.getValues("name");
    if (newTitle && newTitle.trim() !== "") {
      setTitle(newTitle);
    } else {
      form.trigger("name");
    }
    setEditingTitle(false);
  }, [form]);

  const startEditingTitle = () => {
    setEditingTitle(true);
    setTempTitle(form.getValues("name") || title);
  };

  const saveContentChanges = useCallback(() => {
    if (editingSection) {
      const sectionToUpdate = sections.find((s) => s.id === editingSection);
      if (sectionToUpdate) {
        const newContent = form.getValues(sectionToUpdate.key);
        
        if (!newContent || newContent.trim() === "") {
             form.trigger(sectionToUpdate.key);
        }

        setSections((prev) =>
          prev.map((section) =>
            section.id === editingSection
              ? {
                  ...section,
                  content: newContent,
                  status: newContent ? "completed" : "pending",
                }
              : section
          )
        );
      }
      setEditingSection(null);
    }
  }, [editingSection, form, sections]);

  const startEditingContent = (id: number) => {
    const section = sections.find((s) => s.id === id);
    setEditingSection(id);
    setTempContent(form.getValues(section?.key || '') || section?.content || "");
  };

  const createMission = useAction(createMissionAction, {
    onSuccess: (data) => {
      toast({
        title: t("missions.createMission.form.success"),
      });

      if (data.data?.data) {
        router.push(`/missions/${data.data.data.id}/surveys`);
      }
    },
    // 🚨 CORRECTION 3 : Accéder correctement à 'serverError'
    onError: (error) => {
      console.error(error);
      toast({
        title: t("missions.createMission.form.error"),
        description: error.error?.serverError || "Erreur de validation ou serveur.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async () => {
    const values = form.getValues(); 

    const isValid = await form.trigger();
    if (!isValid) {
        toast({
            title: t("missions.createMission.form.error"),
            description: "Veuillez remplir tous les champs obligatoires.",
            variant: "destructive",
        });
        return;
    }

    createMission.execute(
      createMissionSchema.parse({
        ...values,
        audiences: selectedFilters,
        templateId: templateId || undefined,
        mode: mode || undefined,
      })
    );
  };

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingSection, saveContentChanges]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingTitle, saveTitleChanges]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.name !== undefined && values.name !== null) {
        setTitle(values.name);
      }

      sections.forEach((section) => {
        const formValue = values[section.key as keyof typeof values];
        
        if (formValue !== undefined && formValue !== null) {
          setSections((prev) =>
            prev.map((s) =>
              s.key === section.key
                ? {
                    ...s,
                    content: formValue as string,
                    status: formValue ? "completed" : "pending",
                  }
                : s
            )
          );
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form, sections]);

  useEffect(() => {
    if (activeFiltersCount > 0) {
      setSections((prev) =>
        prev.map((s) =>
          s.key === "audiences" ? { ...s, status: "completed" } : s
        )
      );
    }
  }, [activeFiltersCount]);

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="min-h-screen bg-white dark:bg-gray-900 p-4"
    >
      <input type="hidden" {...form.register("hidden")} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 flex-col">
          {editingTitle ? (
            <div ref={editTitleRef} className="mb-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <textarea
                        className="w-full text-black dark:text-white p-2 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    {form.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.name.message as string}
                        </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="flex mt-2 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    form.setValue("name", title);
                    setEditingTitle(false);
                  }}
                  className="text-black dark:text-white"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => saveTitleChanges()}
                >
                  {t("common.save")}
                </Button>
              </div>
            </div>
          ) : (
            <div className=" flex items-center space-x-8">
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
                  <Edit className="w-4 h-4 " />
                </Button>
              </div>
            </div>
          )}

          <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            {t("missions.createMission.form.researchMarket")}
          </span>
        </div>
        <Button variant="default" size="lg" type="submit" disabled={createMission.status === "executing"}>
          {createMission.status === "executing" ? (
            <Icons.spinner className="w-4 h-4 animate-spin" />
          ) : (
            t("common.save")
          )}
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-6">
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
                    : section.status === "completed"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />

              <h2 className="text-black dark:text-white font-bold text-lg flex-grow ">
                {section.title}
              </h2>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => startEditingContent(section.id)}
                >
                  <Edit className="w-4 h-4 " />
                </Button>
              </div>
            </div>

            {/* Contenu de la section */}
            <div className="ml-6">
              {section.id === 4 ? (
                // ... (Logique Audiences inchangée)
                <div className="flex-1 space-x-2 overflow-y-auto">
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
                  {activeFiltersCount > 0 && (
                    <div className="mt-4">
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
                                  selectedFilters![groupId]![
                                    filterId
                                  ] as string[]
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
                      </div>
                    </div>
                  )}
                </div>
              ) : editingSection === section.id ? (
                // Edition de contenu
                <div ref={editSectionRef} className="w-full">
                  <FormField
                    control={form.control}
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
                            }}
                          />
                        </FormControl>
                         {form.formState.errors[section.key as keyof typeof form.formState.errors] && (
                            <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors[section.key as keyof typeof form.formState.errors]?.message as string}
                            </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end mt-2 space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        const previousContent = sections.find(s => s.id === section.id)?.content;
                        form.setValue(section.key, previousContent || "", { shouldValidate: true });
                        setEditingSection(null);
                      }}
                      className="text-black dark:text-white"
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => saveContentChanges()}
                    >
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                // Affichage du contenu
                <button
                  type="button"
                  className="text-black dark:text-white hover:bg-opacity-30 p-2 rounded-md transition-colors text-left"
                  onClick={() => startEditingContent(section.id)}
                >
                  {section.content && section.content.trim() !== ""
                    ? renderBulletedList(section.content) // 👈 Appel corrigé
                    : (section.placeholder || t("missions.createMission.form.placeholder"))}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ... (Modal inchangée) */}
      <AudiencesFilterModal
        onOpenChange={setIsAudiencesFilterModalOpen}
        isOpen={isAudiencesFilterModalOpen}
      />
    </form>
  );
}