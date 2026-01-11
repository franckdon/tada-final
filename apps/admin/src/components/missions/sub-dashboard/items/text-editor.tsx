"use client";

import { useRef, useState } from "react";
import { Button } from "@tada/ui/components/button";
import {
  Edit3,
  Save,
  Trash2,
  Type,
  EllipsisVerticalIcon,
  ShareIcon,
  FileDown,
  Link,
  Copy,
  FileText,
  FileImage,
  File,
} from "lucide-react";
import { MarkdownPreviewCard } from "../../boards/graphs/markdown-preview";
import { DeleteConfirmation } from "@tada/ui/components/customs/delete-confirmation-modal";
import { useBoolean } from "@/hooks/use-boolean";
import { deleteSubDashboardItemAction } from "@/actions/missions/sub-dashboard/delete-subdashboard-item-action";
import { updateSubDashboardItemAction } from "@/actions/missions/sub-dashboard/update-subdashboard-item-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/locales/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@tada/ui/components/dropdown";
import jsPDF from "jspdf";
import rehypeExternalLinks from "rehype-external-links";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface TextItemProps {
  id: string;
  content: string;
  isShared?: boolean;
}

export function TextEditor({ id, content, isShared = true }: TextItemProps) {
  const t = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState<string>(content);
  const [isLoading, setIsLoading] = useState(false);
  const deleteTextModal = useBoolean();
  const chartRef = useRef<HTMLDivElement>(null);

  const deleteSubDashboardItem = useAction(deleteSubDashboardItemAction, {
    onSuccess: () => {
      toast({
        title: t("missions.addSubDashboard.delete.success"),
      });
      setIsLoading(false);
      deleteTextModal.onToggle();
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.delete.error"),
        variant: "destructive",
      });
    },
  });

  const updateSubDashboardItem = useAction(updateSubDashboardItemAction, {
    onSuccess: () => {
      toast({
        title: t("missions.addSubDashboard.update.success"),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.log("error", error);
      toast({
        title: t("missions.addSubDashboard.update.error"),
        variant: "destructive",
      });
    },
  });

  const handleUpdate = () => {
    updateSubDashboardItem.execute({
      id,
      content: executiveSummary,
    });
  };

  const handleDelete = () => {
    deleteSubDashboardItem.execute({
      id,
    });
  };

  const isPending =
    updateSubDashboardItem.status === "executing" ||
    deleteSubDashboardItem.status === "executing";

  const exportText = () => {
    const blob = new Blob([executiveSummary], {
      type: "text/plain;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "executive-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const element = document.getElementById("executive-summary");
    if (!element) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    doc.html(element, {
      callback: (pdf) => {
        pdf.save("executive-summary.pdf");
      },
      x: 20,
      y: 20,
      width: 560,
      windowWidth: 800,
    });
  };

  return (
    <div className="group bg-white p-5">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h2 className="text-sm font-medium flex items-center gap-2">
          <Type className="h-4 w-4" />
          Contenu Texte
        </h2>
        {isShared && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={deleteTextModal.onTrue}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-2">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FileDown className="mr-2 h-4 w-4" />
                    {t("missions.addSubDashboard.surveyItem.export")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={exportToPDF} ref={chartRef}>
                      <File className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportText}>
                      <FileImage className="mr-2 h-4 w-4" />
                      Txt
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {/* <DropdownMenuItem onClick={() => {}}>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  <span>{t("missions.addSubDashboard.surveyItem.share")}</span>
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div>
        {isEditing ? (
          <div className="space-y-3">
            <MarkdownPreviewCard
              title=""
              description=""
              participationQuestions=""
              content={executiveSummary}
              onChange={(value) => setExecutiveSummary(value)}
              editable
              showPreview={false}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={isPending}>
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div id="executive-summary">
            <MarkdownPreview
              className="markdown-tile bg-white dark:bg-slate-700 dark:text-white "
              source={executiveSummary || ""}
              rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
              style={{ padding: 16 }}
            />
          </div>
        )}
      </div>

      <DeleteConfirmation
        isOpen={deleteTextModal.value}
        onToggle={deleteTextModal.onToggle}
        title={t("missions.addSubDashboard.textItem.deleteTitle")}
        message={t("missions.addSubDashboard.textItem.deleteMessage")}
        confirmLabel={t("missions.addSubDashboard.textItem.deleteConfirm")}
        cancelLabel={t("missions.addSubDashboard.textItem.deleteCancel")}
        deletingText={t("missions.addSubDashboard.textItem.deleting")}
        onConfirm={handleDelete}
        isDeletingInfo={deleteSubDashboardItem.status === "executing"}
      />
    </div>
  );
}
