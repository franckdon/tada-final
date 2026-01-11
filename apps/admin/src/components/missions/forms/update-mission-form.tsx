import { Icons } from "@/components/icons";
import { useAudiencesFilter } from "@/context/audiences-filter-context";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { FormControl, FormField, FormItem } from "@tada/ui/components/form";
import { Edit } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AudiencesFilterModal } from "../modals/audiences-filter-modal";
import { Mission, TempMission } from "@prisma/client";
import { updateMissionAction } from "@/actions/missions/update-mission-action";

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

export function UpdateMissionForm({
  originalMissionId,
  inComingMission,
}: {
  inComingMission: Mission | TempMission;
  originalMissionId: string;
}) {
  const t = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const form = useFormContext();
  const editSectionRef = useRef<HTMLDivElement>(null);
  const editTitleRef = useRef<HTMLDivElement>(null);
  const [isAudiencesFilterModalOpen, setIsAudiencesFilterModalOpen] =
    useState(false);
  const [title, setTitle] = useState(
    inComingMission.name || t("missions.createMission.form.name")
  );
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [tempContent, setTempContent] = useState("");
  const [mission, setMission] = useState<Mission | null>(null);
  const haveSurveys = "pending";
  const {
    activeFiltersCount,
    selectedFilters,
    filterGroups,
    handleOptionSelect,
  } = useAudiencesFilter();

  const updateMission = useAction(updateMissionAction, {
    onSuccess: ({ data }) => {
      console.log("data - updateMission", data);
      toast({
        title: t("missions.surveys.edited"),
      });
    },
    onError: ({ error }) => {
      console.log("errorrrrr", error);
      toast({
        title: t("missions.update.genericError"),
        variant: "destructive",
      });
    },
  });

  const [sections, setSections] = useState<Section[]>([
    {
      id: 1,
      key: "problemSummary",
      title: t("missions.createMission.form.problemSummary"),
      content: inComingMission.problemSummary || "",
      status: "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 2,
      key: "objectives",
      title: t("missions.createMission.form.strategicGoal"),
      content: inComingMission.objectives || "",
      status: "pending",
      placeholder: t("missions.createMission.form.placeholder"),
      color: "green",
    },
    {
      id: 3,
      key: "assumptions",
      title: t("missions.createMission.form.assumptions"),
      content: inComingMission.assumptions || "",
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

  const startEditingTitle = () => {
    setEditingTitle(true);
    setTempTitle(title);
  };

  const saveTitleChanges = () => {
    if (tempTitle && tempTitle.trim() !== "") {
      setTitle(tempTitle);
    }
    setEditingTitle(false);
  };

  const startEditingContent = (id: number) => {
    const section = sections.find((s) => s.id === id);
    setEditingSection(id);
    setTempContent(section?.content || "");
  };

  const saveContentChanges = () => {
    if (editingSection) {
      setSections(
        sections?.map((section) =>
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
    }
  };

  const onSubmit = async (values: any) => {
    console.log("updateMission", values);

    updateMission.execute({
      name: values?.name,
      missionId: originalMissionId,
      status: "on hold",
      problemSummary: values?.problemSummary,
      objectives: values?.objectives,
      assumptions: values?.assumptions,
      audiences: values?.audiences,
    });
  };

  function renderBulletedList(text: string): JSX.Element {
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
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editingSection &&
        editSectionRef.current &&
        !editSectionRef.current.contains(
          (event as unknown as React.ChangeEvent<HTMLInputElement>).target
        )
      ) {
        saveContentChanges();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingSection]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        editingTitle &&
        editTitleRef.current &&
        !editTitleRef.current.contains(
          (event as unknown as React.ChangeEvent<HTMLInputElement>).target
        )
      ) {
        saveTitleChanges();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingTitle]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.name) {
        setTitle(values.name);
      }

      // biome-ignore lint/complexity/noForEach: <explanation>
      sections.forEach((section) => {
        if (values[section.key]) {
          setSections((prev) =>
            prev.map((s) =>
              s.key === section.key
                ? {
                    ...s,
                    content: values[section.key],
                    status: values[section.key] ? "completed" : "pending",
                  }
                : s
            )
          );
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
      {/* <input type="hidden" {...form.register("hidden")} /> */}

      <div className="flex justify-between items-center gap-2 mb-6">
        <div className="flex flex-col w-full">
          {editingTitle ? (
            <div ref={editTitleRef} className="">
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
            <div className=" flex space-x-8 items-center">
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
          {/* 
          <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            {t("missions.createMission.form.researchMarket")}
          </span> */}
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
        <Button variant="default" size="lg" type="submit">
          {updateMission.status === "executing" ? (
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
              {/* Point coloré indiquant le statut */}
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

              {/* Boutons d'action */}
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
                        if (editingSection) {
                          form.setValue(section.key, tempContent);
                        }
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
                  className="text-black dark:text-white hover:bg-opacity-30 p-2 rounded-md transition-colors"
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
        {/* {organization?.status === "active" && (
          <div className="bg-[#FFD3CE] dark:bg-gray-900 border border-[#FFD3CE] rounded-md p-4">
            <div className="flex items-center mb-3">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  haveSurveys === "pending"
                    ? "bg-yellow-400"
                    : haveSurveys === "completed"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
              <h2 className="text-black dark:text-white font-bold text-lg flex-grow ">
                {t("missions.createMission.form.surveys")}
              </h2>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    if (mission) {
                      router.push(`/missions/${mission.id}/surveys`);
                      return;
                    }
                    toast({
                      title: t("missions.surveys.saveAfterSurvey"),
                      variant: "destructive",
                    });
                  }}
                >
                  <Edit className="w-4 h-4 " />
                </Button>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              type="button"
              onClick={() => {
                if (mission) {
                  router.push(`/missions/${mission.id}/surveys`);
                  return;
                }
                toast({
                  title: t("missions.surveys.saveAfterSurvey"),
                  variant: "destructive",
                });
              }}
            >
              {t("missions.createMission.form.showSurveys")}
            </Button>
          </div>
        )} */}
      </div>

      <AudiencesFilterModal
        onOpenChange={setIsAudiencesFilterModalOpen}
        isOpen={isAudiencesFilterModalOpen}
      />
    </form>
  );
}
