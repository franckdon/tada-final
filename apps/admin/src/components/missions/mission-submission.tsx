"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tada/ui/components/table";
import { Button } from "@tada/ui/components/button";
import { Badge } from "@tada/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tada/ui/components/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@tada/ui/components/sheet";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  X,
  FileText,
  Calendar,
  MoreHorizontal,
  CheckSquare,
  ChevronDown,
  Map,
  Rows3,
  Clock,
  User,
  MapPin,
  MessageSquare,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tada/ui/components/tabs";
import { MapboxMap } from "./mapbox-review";
import { useI18n } from "@/locales/client";
import { MapLocation } from "@/types/survey-response";
import { ExportMissionIdButton } from "./export-mission-by-button";

export type MissionSubmissionProps = {
  rows: Record<string, any>[];
  surveys: Record<string, any>[];
  locations: MapLocation[];
  params: {
    missionId: string;
  };
};

export const MissionSubmission = ({
  rows,
  surveys,
  locations,
  params,
}: MissionSubmissionProps) => {
  const t = useI18n();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );

  // Extraire les colonnes des réponses depuis les surveys
  const responseColumns = useMemo(() => {
    if (!surveys || surveys.length === 0) return [];
    const firstSurvey = surveys[0];
    return Object.keys(firstSurvey?.responses || {});
  }, [surveys]);

  // Fonction pour rendre une réponse selon son type
  const renderResponseByType = (type: string, answer: any) => {
    switch (type) {
      case "boolean":
        return formatBoolean(answer);
      case "rating":
        return (
          <div className="flex items-center">
            {renderStars(Number(answer))}
            <span className="ml-2">{answer}</span>
          </div>
        );
      case "text":
      case "comment":
        return (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="line-clamp-2 cursor-help">{String(answer)}</div>
              </TooltipTrigger>
              <TooltipContent
                className="max-w-md p-2 bg-white border"
                side="top"
              >
                <p className="text-sm">{String(answer)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case "checkbox":
        if (Array.isArray(answer)) {
          return formatCheckboxArrayTable(answer);
        }
        return formatCheckboxTable(String(answer));
      case "dropdown":
        return formatDropdownTable(String(answer));
      case "file":
        return formatFile(String(answer));
      case "multiple":
        if (Array.isArray(answer)) {
          return formatMultipleChoiceArrayTable(answer);
        }
        return formatMultipleChoiceTable(String(answer));
      case "date":
        return formatDate(String(answer));
      default:
        if (typeof answer === "string" && answer.length > 10) {
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="line-clamp-2 cursor-help">{answer}</div>
                </TooltipTrigger>
                <TooltipContent
                  className="max-w-md p-2 bg-white border"
                  side="top"
                >
                  <p className="text-sm">{answer}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return String(answer);
    }
  };

  // Fonction pour rendre une réponse détaillée dans la Sheet
  const renderDetailedResponseByType = (type: string, answer: any) => {
    switch (type) {
      case "boolean":
        return <div className="mt-1">{formatBoolean(answer)}</div>;
      case "rating":
        return (
          <div className="flex items-center mt-1">
            {renderStars(Number(answer))}
            <span className="ml-2 text-orange-800 font-medium">{answer}/5</span>
          </div>
        );
      case "text":
      case "comment":
        return renderDetailedTextResponse(String(answer));
      case "checkbox":
        if (Array.isArray(answer)) {
          return formatCheckboxArray(answer);
        }
        return formatCheckbox(String(answer));
      case "dropdown":
        return formatDropdown(String(answer));
      case "file":
        return <div className="mt-1">{formatFile(String(answer))}</div>;
      case "multiple":
        if (Array.isArray(answer)) {
          return formatMultipleChoiceArray(answer);
        }
        return (
          <div className="mt-1">{formatMultipleChoice(String(answer))}</div>
        );
      case "date":
        return (
          <div className="mt-1 text-orange-800">
            {formatDate(String(answer))}
          </div>
        );
      default:
        return renderDetailedTextResponse(String(answer));
    }
  };

  // Fonctions de formatage pour le tableau (versions compactes)
  const formatCheckboxArrayTable = (choices: string[]) => {
    if (!choices || choices.length === 0) return "-";
    return (
      <div className="flex flex-col gap-1">
        {choices.slice(0, 2).map((choice, index) => (
          <div key={index} className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-orange-500" />
            <span className="text-sm">{choice}</span>
          </div>
        ))}
        {choices.length > 2 && (
          <span className="text-xs text-gray-500">
            +{choices.length - 2} autres
          </span>
        )}
      </div>
    );
  };

  const formatCheckboxTable = (value: string) => {
    if (!value) return "-";
    const choices = value.split(",").map((choice) => choice.trim());
    return formatCheckboxArrayTable(choices);
  };

  const formatMultipleChoiceArrayTable = (choices: string[]) => {
    if (!choices || choices.length === 0) return "-";
    return (
      <div className="flex flex-wrap gap-1">
        {choices.slice(0, 2).map((choice, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-orange-100 text-orange-800 text-xs"
          >
            {choice}
          </Badge>
        ))}
        {choices.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{choices.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  const formatMultipleChoiceTable = (value: string) => {
    if (!value) return "-";
    const choices = value.split(",").map((choice) => choice.trim());
    return formatMultipleChoiceArrayTable(choices);
  };

  const formatDropdownTable = (value: string) => {
    if (!value) return "-";
    return (
      <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-md border border-orange-200 w-fit">
        <ChevronDown className="h-3 w-3 text-orange-500" />
        <span className="text-orange-800 text-sm">{value}</span>
      </div>
    );
  };

  // Fonctions de formatage pour la Sheet (versions détaillées)
  const formatCheckboxArray = (choices: string[]) => {
    if (!choices || choices.length === 0) return null;
    return (
      <div className="mt-2 space-y-2">
        {choices.map((choice, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-orange-50 p-2 rounded-md border border-orange-200"
          >
            <CheckSquare className="h-4 w-4 text-orange-500" />
            <span className="text-orange-900">{choice}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatCheckbox = (value: string) => {
    if (!value) return null;
    const choices = value.split(",").map((choice) => choice.trim());
    return formatCheckboxArray(choices);
  };

  const formatMultipleChoiceArray = (choices: string[]) => {
    if (!choices || choices.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {choices.map((choice, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-orange-100 text-orange-800"
          >
            {choice}
          </Badge>
        ))}
      </div>
    );
  };

  const formatMultipleChoice = (value: string) => {
    if (!value) return "-";
    const choices = value.split(",").map((choice) => choice.trim());
    return (
      <div className="flex flex-wrap gap-1">
        {choices.map((choice, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-orange-100 text-orange-800"
          >
            {choice}
          </Badge>
        ))}
      </div>
    );
  };

  const formatDropdown = (value: string) => {
    if (!value) return null;
    return (
      <div className="mt-2 bg-orange-50 p-3 rounded-md border border-orange-200 inline-block">
        <div className="flex items-center gap-2">
          <ChevronDown className="h-4 w-4 text-orange-500" />
          <span className="text-orange-900 font-medium">{value}</span>
        </div>
      </div>
    );
  };

  const renderDetailedTextResponse = (text: string) => {
    if (!text || text === "-") return null;
    const segments = text
      .split(/(?<=\.)(?=\s)|(?<=\?)(?=\s)|(?<=!)(?=\s)/)
      .filter((segment) => segment.trim().length > 0);

    return (
      <div className="space-y-2 mt-2">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="bg-orange-50 text-orange-900 p-3 rounded-2xl inline-block max-w-[85%]"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {segment.trim()}
          </div>
        ))}
      </div>
    );
  };

  // Fonction pour rendre les étoiles
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`inline h-4 w-4 ${
            i < rating ? "text-orange-400 fill-orange-400" : "text-gray-300"
          }`}
        />
      ));
  };

  // Fonction pour formater les valeurs booléennes
  const formatBoolean = (value: any) => {
    const boolValue = value === "true" || value === true;
    return boolValue ? (
      <Badge className="bg-orange-400 hover:bg-orange-500 w-[60px] flex justify-between items-center">
        <Check className="h-3 w-3" /> Oui
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-gray-400 border-gray-500 flex justify-between w-[60px] items-center"
      >
        <X className="h-3 w-3" /> Non
      </Badge>
    );
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Fonction pour formater les fichiers

  const formatFile = (value: string) => {
    if (!value) return "-";

    const files = value?.split(",")?.map((file) => file?.trim()) || [];

    const isImage = (filename: string) => {
      const ext = filename.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
        ext || ""
      );
    };

    const getFileName = (filepath: string) => {
      return filepath.split("/").pop() || filepath;
    };

    return (
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow max-w-[200px]"
          >
            {/* Miniature */}
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              {isImage(file) ? (
                <img
                  src={`/placeholder.svg?height=48&width=48`}
                  alt={getFileName(file)}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
              ) : null}
            </div>

            {/* Nom du fichier */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-gray-900 truncate"
                title={getFileName(file)}
              >
                {getFileName(file)}
              </p>
              <p className="text-xs text-gray-500">
                {file.split(".").pop()?.toUpperCase() || "Fichier"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Fonction pour obtenir l'icône du type de question
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "boolean":
        return <Check className="h-3 w-3 text-orange-400" />;
      case "rating":
        return <Star className="h-3 w-3 text-orange-400" />;
      case "date":
        return <Calendar className="h-3 w-3 text-orange-400" />;
      case "file":
        return <FileText className="h-3 w-3 text-orange-400" />;
      case "multiple":
      case "checkbox":
        return <CheckSquare className="h-3 w-3 text-orange-400" />;
      case "dropdown":
        return <ChevronDown className="h-3 w-3 text-orange-400" />;
      case "comment":
        return <MessageSquare className="h-3 w-3 text-orange-400" />;
      case "text":
      default:
        return <FileText className="h-3 w-3 text-orange-400" />;
    }
  };

  // Fonction pour tronquer le texte des en-têtes
  const getTruncatedHeader = (text: string, maxLength = 15) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Fonction pour gérer le clic sur une ligne
  const handleRowClick = (row: Record<string, any>) => {
    setSelectedRow(row);
    setIsSheetOpen(true);
  };

  // Fonction pour obtenir les informations d'identité
  const getIdentityInfo = (row: Record<string, any>) => {
    if (!row) return null;

    // Chercher le nom dans les réponses
    const nameResponse =
      row.responses?.["Quel est votre nom ?"]?.answer ||
      row.responses?.["Nom"]?.answer ||
      row.responses?.["Name"]?.answer;

    return (
      <div className="bg-orange-100 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-orange-700" />
          <h3 className="text-lg font-medium text-orange-800">
            {nameResponse || "Utilisateur anonyme"}
          </h3>
        </div>

        <div className="mt-2 space-y-1">
          {/* Âge */}
          {row.age && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <span>{row.age}</span>
              <span>ans</span>
            </p>
          )}

          {/* Genre */}
          {row.gender && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <span>
                {row.gender === "male"
                  ? "Homme"
                  : row.gender === "female"
                  ? "Femme"
                  : row.gender}
              </span>
            </p>
          )}

          {/* Localisation */}
          {row.location?.label && (
            <p className="text-sm text-orange-700 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-orange-700" />
              <span>{row.location.label}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  // Fonction pour obtenir les informations de date
  const getDateInfo = (row: Record<string, any>) => {
    if (!row) return null;

    const submittedAt = row.submittedAt || row.createdAt;
    if (!submittedAt) return null;

    return (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>Soumis le {formatDate(submittedAt)}</span>
      </div>
    );
  };

  const tableColumns = useMemo<ColumnDef<any, any>[]>(
    () =>
      responseColumns.map((question) => ({
        accessorKey: `responses.${question}.answer`,
        header: () => (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 border-b border-dotted border-gray-400 cursor-help">
                  {surveys[0]?.responses?.[question]?.type && (
                    <span className="mr-1">
                      {getQuestionTypeIcon(surveys[0].responses[question].type)}
                    </span>
                  )}
                  {getTruncatedHeader(question)}
                  <MoreHorizontal className="h-3 w-3 ml-1 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white p-2 border">
                <p className="text-sm font-medium">{question}</p>
                <p className="text-xs text-muted-foreground">
                  Type: {surveys[0]?.responses?.[question]?.type || "texte"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        cell: (info) => {
          const row = info.row.original;
          const responseData = row.responses?.[question];
          if (!responseData) return "-";
          return renderResponseByType(responseData.type, responseData.answer);
        },
      })),
    [responseColumns, surveys]
  );

  const table = useReactTable({
    data: surveys,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Tabs defaultValue="list" className="w-full">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold text-[#f55e4f] mb-5">
          {t("missions.missionSubmission.title")}
        </h1>
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="list">
              <Rows3 size={20} className="mr-1" />{" "}
              {t("missions.missionSubmission.tabs.list")}
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map size={20} className="mr-1" />
              {t("missions.missionSubmission.tabs.map")}
            </TabsTrigger>
          </TabsList>

          <Button variant="secondary">
            {t("missions.missionSubmission.export")}
          </Button>
          <ExportMissionIdButton missionId={params?.missionId} />
        </div>
      </div>
      <TabsContent value="list">
        <div className="overflow-auto border border-gray-200 max-h-[calc(100vh-250px)]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-sm px-4 py-2 text-gray-700 bg-gray-50"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  className={`${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } cursor-pointer hover:bg-orange-50`}
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-sm px-4 py-2 align-middle"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-orange-300 hover:bg-orange-50"
            >
              <ChevronLeft className="h-4 w-4 text-orange-600" />
            </Button>
            <div className="hidden md:flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const pageIndex = i;
                  const isActive =
                    pageIndex === table.getState().pagination.pageIndex;
                  return (
                    <Button
                      key={i}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={
                        isActive
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "border-orange-300 hover:bg-orange-50"
                      }
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                }
              )}
              {table.getPageCount() > 5 && (
                <span className="text-gray-500">...</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-orange-300 hover:bg-orange-50"
            >
              <ChevronRight className="h-4 w-4 text-orange-600" />
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="map">
        <MapboxMap
          height="600px"
          accessToken="pk.eyJ1Ijoia29rb3Vhc2VyZ2U4OSIsImEiOiJja2x0aThqNTgyNmp4MnFuMWNucnUxdDJhIn0.qv3knVmVo7Y_Nn6PtYNn_w"
          surveys={surveys}
          columns={responseColumns}
          initialViewState={{
            longitude: locations[0]?.coordinates?.[0] || 60,
            latitude: locations[0]?.coordinates?.[1] || 20,
            zoom: 6,
          }}
        />
      </TabsContent>

      {/* Sheet pour afficher les détails de la ligne sélectionnée */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="border-b pb-4 mb-6">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-orange-800 font-bold">
                Détails de la réponse
                {selectedRow && getDateInfo(selectedRow)}
              </SheetTitle>
            </div>
          </SheetHeader>

          {selectedRow && (
            <div className="space-y-6">
              {/* Informations de base */}
              {getIdentityInfo(selectedRow)}

              {/* Réponses aux questions */}
              <div className="space-y-6">
                {selectedRow?.responses &&
                  Object.entries(selectedRow.responses).map(
                    ([question, responseData]) => {
                      const { type, answer } = responseData as {
                        type: string;
                        answer: any;
                      };

                      if (
                        answer === undefined ||
                        answer === null ||
                        answer === ""
                      )
                        return null;

                      return (
                        <div
                          key={question}
                          className="border-b border-gray-100 pb-4"
                        >
                          <div className="flex items-center gap-1">
                            {getQuestionTypeIcon(type) && (
                              <span className="text-orange-500">
                                {getQuestionTypeIcon(type)}
                              </span>
                            )}
                            <h4 className="text-sm font-medium text-gray-500">
                              {question}
                            </h4>
                          </div>

                          {renderDetailedResponseByType(type, answer)}
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Tabs>
  );
};
