// lib/export-utils.ts
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefObject } from "react";

export async function exportAsImage(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element);
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${fileName}.png`;
  link.click();
}

export async function exportAsPDF(element: HTMLElement, fileName: string) {
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape" });
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, width, height);
  pdf.save(`${fileName}.pdf`);
}

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

export const handleExportPPT = async (
  chartRef: RefObject<HTMLDivElement>,
  question: string,
  title: string
) => {
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
    // pres.layout = "LAYOUT_16x9";
    // pres.author = "Survey Dashboard";
    // pres.company = "Your Company";
    // pres.title = `Analyse: ${title}`;

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
    if (question) {
      slide.addText(question, {
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
      fileName: `${title || "export"}.pptx`,
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
