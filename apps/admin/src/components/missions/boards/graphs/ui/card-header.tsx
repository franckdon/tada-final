"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@tada/ui/components/button";
import { CardDescription } from "@tada/ui/components/card";
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
import {
  EllipsisVerticalIcon,
  ShareIcon,
  FileDown,
  Link,
  Copy,
  FileText,
  FileImage,
  File,
} from "lucide-react";
import { useQueryState } from "nuqs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import { RefObject } from "react";

export const CardHeaderChart = ({
  participationQuestions,
  title,
  isDeletable = false,
  onDelete,
  exportTargetId = "chart-container",
  chartRef,
  handleExportCsv,
}: {
  participationQuestions: string;
  title: string;
  isDeletable?: boolean;
  onDelete?: () => void;
  handleExportCsv?: () => void;
  exportTargetId?: string;
  chartRef?: RefObject<HTMLDivElement>;
}) => {
  const t = useI18n();
  const [questionId, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });

  // const handleExportCSV = () => {
  //   window.open(`/api/export-question-csv?id=${questionId}`, "_blank");
  // };

  const handleExportPNG = async () => {
    if (!chartRef?.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `question-${questionId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erreur d'export PNG :", err);
    }
  };

  const handleExportPDF = async () => {
    if (!chartRef?.current) {
      console.error("Élément introuvable pour l'export.");
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("chart-export.pdf");
    } catch (err) {
      console.error("Erreur lors de l'export PDF :", err);
    }
  };

  const handleCopyRawData = () => {
    navigator.clipboard
      .writeText(`https://example.com/api/raw-data/${questionId}`)
      .then(() => {
        toast({
          title: "Lien vers les données brutes copié !",
        });
      })
      .catch(() => {
        toast({ title: "Échec de la copie", variant: "destructive" });
      });
  };

  const handleCopyPublicLink = () => {
    navigator.clipboard
      .writeText(`https://example.com/public/question/${questionId}`)
      .then(() => {
        toast({
          title: "Lien public copié !",
        });
      })
      .catch(() => {
        toast({ title: "Échec de la copie", variant: "destructive" });
      });
  };

  return (
    <div className="group relative">
      <div className="flex justify-between items-center">
        <CardDescription>{participationQuestions}</CardDescription>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isDeletable && (
            <Button variant="destructive" onClick={onDelete}>
              {t("common.delete")}
            </Button>
          )}
          {!isDeletable && (
            <Button variant="outline" onClick={() => setQuestionId(title)}>
              {t("common.update")}
            </Button>
          )}

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
                  {handleExportCsv && (
                    <DropdownMenuItem onClick={handleExportCsv}>
                      <FileText className="mr-2 h-4 w-4" />
                      CSV
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <File className="mr-2 h-4 w-4" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPNG}>
                    <FileImage className="mr-2 h-4 w-4" />
                    PNG
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => {}}>
                <ShareIcon className="mr-2 h-4 w-4" />
                <span>{t("missions.addSubDashboard.surveyItem.share")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleCopyRawData}>
                <Copy className="mr-2 h-4 w-4" />
                Copier les données brutes
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleCopyPublicLink}>
                <Link className="mr-2 h-4 w-4" />
                Copier le lien public
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
