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
  FileDown,
  Link,
  Copy,
  FileText,
  FileImage,
  File,
  Presentation,
} from "lucide-react";
import { useQueryState } from "nuqs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/hooks/use-toast";
import type { RefObject } from "react";
import { useSession } from "@/lib/auth-client";

// Import dynamique de pptxgenjs pour éviter les erreurs SSR
const loadPptxGen = async () => {
  try {
    // Import dynamique côté client uniquement
    const PptxGenJS = await import("pptxgenjs");
    return PptxGenJS.default || PptxGenJS;
  } catch (error) {
    console.error("Erreur lors du chargement de pptxgenjs:", error);
    throw new Error("Impossible de charger la bibliothèque PowerPoint");
  }
};

export const CardHeaderChart = ({
  participationQuestions,
  title,
  isDeletable = false,
  onDelete,
  exportTargetId = "chart-container",
  chartRef,
  handleExportCsv,
  subDashboardItemId, // Nouveau prop pour l'ID de l'item

  onCommentsClick,
  commentCount = 0,
}: {
  participationQuestions: string;
  title: string;
  isDeletable?: boolean;
  onDelete?: () => void;
  handleExportCsv?: () => void;
  exportTargetId?: string;
  chartRef?: RefObject<HTMLDivElement>;
  subDashboardItemId: string; // Nouveau prop

  onCommentsClick?: () => void;
  commentCount?: number;
}) => {
  const t = useI18n();
  const { data: session } = useSession();
  const [questionId, setQuestionId] = useQueryState("questionId", {
    defaultValue: "",
  });

  // ... (garder toutes les fonctions d'export existantes)
  const handleExportPNG = async () => {
    if (!chartRef?.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 1.5,
        backgroundColor: "#ffffff",
      });

      const dataUrl = canvas.toDataURL("image/jpeg");
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
    if (!chartRef?.current) return;

    chartRef.current.querySelectorAll(".non-exportable").forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.display = "none";
      }
    });

    try {
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const targetWidth = 180;
      const targetHeight = (imgProps.height * targetWidth) / imgProps.width;

      pdf.addImage(imgData, "JPEG", 15, 10, targetWidth, targetHeight);
      pdf.save("chart-export.pdf");

      // Réafficher les éléments masqués
      chartRef.current.querySelectorAll(".non-exportable").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = "block";
        }
      });
    } catch (err) {
      console.error("Erreur lors de l'export PDF :", err);
    }
  };

  const handleExportPPT = async () => {
    if (!chartRef?.current) return;

    try {
      // Masquer les éléments non exportables
      chartRef.current.querySelectorAll(".non-exportable").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = "none";
        }
      });

      // Obtenir les dimensions réelles de l'élément
      const rect = chartRef.current.getBoundingClientRect();

      // Capturer le graphique en image avec des paramètres optimisés
      const canvas = await html2canvas(chartRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff",
        width: rect.width,
        height: rect.height,
        windowWidth: rect.width,
        windowHeight: rect.height,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");

      // Charger pptxgenjs dynamiquement
      const pptx = await loadPptxGen();
      const pres = new pptx();

      // Configuration de la présentation
      pres.layout = "LAYOUT_16x9";
      pres.author = "Survey Dashboard";
      pres.company = "Your Company";
      pres.title = `Analyse: ${title}`;

      // Ajouter une slide
      const slide = pres.addSlide();

      // Calculer les dimensions optimales pour l'image
      const slideWidth = 10; // largeur totale de la slide en inches
      const slideHeight = 5.625; // hauteur totale de la slide en inches (16:9)
      const margin = 0.5;

      // Espace disponible après titre et description
      const availableHeight = slideHeight - 2.5; // 2.5 inches pour titre + description + marge
      const availableWidth = slideWidth - 2 * margin;

      // Calculer le ratio de l'image
      const imgRatio = canvas.width / canvas.height;

      // Calculer les dimensions finales en gardant le ratio
      let finalWidth = availableWidth;
      let finalHeight = availableWidth / imgRatio;

      // Si l'image est trop haute, ajuster par la hauteur
      if (finalHeight > availableHeight) {
        finalHeight = availableHeight;
        finalWidth = availableHeight * imgRatio;
      }

      // Centrer l'image
      const imageX = (slideWidth - finalWidth) / 2;
      const imageY = 2.2; // Position après le titre et description

      // Ajouter un titre plus compact
      slide.addText(title, {
        x: margin,
        y: 0.3,
        w: slideWidth - 2 * margin,
        h: 0.8,
        fontSize: 20,
        fontFace: "Arial",
        color: "363636",
        bold: true,
        align: "center",
      });

      // Ajouter la description de manière plus compacte
      if (participationQuestions) {
        slide.addText(participationQuestions, {
          x: margin,
          y: 1.1,
          w: slideWidth - 2 * margin,
          h: 0.6,
          fontSize: 12,
          fontFace: "Arial",
          color: "666666",
          align: "center",
        });
      }

      slide.addImage({
        data: imgData,
        x: imageX,
        y: imageY,
        w: finalWidth,
        h: finalHeight,
        sizing: {
          type: "contain",
          w: finalWidth,
          h: finalHeight,
        },
      });

      slide.addText(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
        x: margin,
        y: slideHeight - 0.4,
        w: slideWidth - 2 * margin,
        h: 0.3,
        fontSize: 8,
        fontFace: "Arial",
        color: "999999",
        align: "right",
      });

      await pres.writeFile({
        fileName: `chart-${questionId || "export"}.pptx`,
      });

      toast({
        title: "Export PowerPoint réussi !",
        description: "Votre présentation a été téléchargée.",
      });

      chartRef.current.querySelectorAll(".non-exportable").forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.display = "block";
        }
      });
    } catch (err) {
      console.error("Erreur lors de l'export PPT :", err);
      toast({
        title: "Erreur d'export",
        description: "Impossible de générer le fichier PowerPoint.",
        variant: "destructive",
      });

      // Réafficher les éléments masqués en cas d'erreur
      if (chartRef?.current) {
        chartRef.current.querySelectorAll(".non-exportable").forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.display = "block";
          }
        });
      }
    }
  };

  const handleCopyRawData = () => {
    navigator.clipboard
      .writeText(`https://example.com/api/raw-data/${questionId}`)
      .then(() => {
        toast({ title: "Lien vers les données brutes copié !" });
      })
      .catch(() => {
        toast({ title: "Échec de la copie", variant: "destructive" });
      });
  };

  const handleCopyPublicLink = () => {
    navigator.clipboard
      .writeText(`https://example.com/public/question/${questionId}`)
      .then(() => {
        toast({ title: "Lien public copié !" });
      })
      .catch(() => {
        toast({ title: "Échec de la copie", variant: "destructive" });
      });
  };

  const handleCopyIframe = () => {
    // Générer un token unique pour cette intégration (similaire à Appinio)
    const surveyToken = generateSurveyToken();
    const embedUrl = `https://yourapp.com/#/fr/survey?s=${questionId}&t=${surveyToken}`;

    const iframeCode = `<iframe style="width:1400px;max-width:100%;height:680px;border:none;" class="embed-survey" src="${embedUrl}" title="${title}"></iframe>`;

    navigator.clipboard
      .writeText(iframeCode)
      .then(() => {
        toast({
          title: "Code iframe copié !",
          description: "Vous pouvez maintenant l'intégrer dans votre site web.",
        });
      })
      .catch(() => {
        toast({
          title: "Échec de la copie",
          variant: "destructive",
        });
      });
  };

  const generateSurveyToken = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  return (
    <>
      <div className="group relative non-exportable">
        <div className="flex justify-between items-center">
          <CardDescription>{participationQuestions}</CardDescription>
          <div className="flex gap-2">
            {/** Bouton commentaires */}
            {onCommentsClick && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCommentsClick}
                className="relative"
                title={title}
              >
                {t("comments.button")}
                {commentCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] px-1">
                    {commentCount}
                  </span>
                )}
              </Button>
            )}

            {isDeletable ? (
              <Button variant="destructive" onClick={onDelete}>
                {t("common.delete")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setQuestionId(title)}>
                {t("common.edit")}
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
                        {t("missions.addSubDashboard.surveyItem.exportCsv")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <File className="mr-2 h-4 w-4" />
                      {t("missions.addSubDashboard.surveyItem.exportPdf")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPNG}>
                      <FileImage className="mr-2 h-4 w-4" />
                      {t("missions.addSubDashboard.surveyItem.exportPng")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPPT}>
                      <Presentation className="mr-2 h-4 w-4" />
                      {t("missions.addSubDashboard.surveyItem.exportPpt")}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyRawData}>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("missions.addSubDashboard.surveyItem.copyRawData")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyPublicLink}>
                  <Link className="mr-2 h-4 w-4" />
                  {t("missions.addSubDashboard.surveyItem.copyPublicLink")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
};
