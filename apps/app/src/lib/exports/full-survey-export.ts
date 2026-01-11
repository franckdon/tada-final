// src/lib/exports/full-survey-export.ts
"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// import dynamique pptxgenjs (comme tu fais déjà)
const loadPptxGen = async () => {
  const PptxGenJS = await import("pptxgenjs");
  return (PptxGenJS as any).default || (PptxGenJS as any);
};

type ExportNode = {
  id: string;
  title: string;
  element: HTMLElement;
};

export function collectExportNodes(): ExportNode[] {
  // Supporte les 2 attributs (ancien + nouveau)
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[data-export-question="true"], [data-export-id]'
    )
  );

  return nodes
    .map((el) => {
      const id =
        el.getAttribute("data-export-id") ||
        el.getAttribute("id") ||
        el.getAttribute("data-question-key") ||
        "question";

      const title =
        el.getAttribute("data-export-title") ||
        el.querySelector("h2, h3")?.textContent?.trim() ||
        el.getAttribute("data-question-key") ||
        id;

      return { id, title, element: el };
    })
    .filter((x) => !!x.element);
}

/** Masque tous les .non-exportable d’un subtree */
function hideNonExportables(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>(".non-exportable"));
  const previous = els.map((el) => ({ el, display: el.style.display }));
  els.forEach((el) => (el.style.display = "none"));
  return () => previous.forEach(({ el, display }) => (el.style.display = display));
}

/** Capture HTML -> image PNG dataUrl */
async function captureElement(el: HTMLElement) {
  const restore = hideNonExportables(el);

  try {
    const rect = el.getBoundingClientRect();
    const canvas = await html2canvas(el, {
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

    return canvas.toDataURL("image/png");
  } finally {
    restore();
  }
}

// ---------------------------------------------
// PDF: 1 page = 1 question
// ---------------------------------------------
export async function exportFullSurveyPdf(filename = "survey-export.pdf") {
  const items = collectExportNodes();
  if (!items.length) throw new Error("Aucune question trouvée pour l’export");

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < items.length; i++) {
    const { title, element } = items[i]!;
    const img = await captureElement(element);

    if (i > 0) pdf.addPage();

    // Header
    pdf.setFontSize(14);
    pdf.text(title.slice(0, 120), 12, 12);

    // Image
    const margin = 12;
    const availableW = pageW - margin * 2;
    const availableH = pageH - 20 - margin; // header space

    // jsPDF needs image props
    const imgProps = pdf.getImageProperties(img);
    const ratio = imgProps.width / imgProps.height;

    let w = availableW;
    let h = w / ratio;

    if (h > availableH) {
      h = availableH;
      w = h * ratio;
    }

    const x = (pageW - w) / 2;
    const y = 18;

    pdf.addImage(img, "PNG", x, y, w, h);
  }

  pdf.save(filename);
}

// ---------------------------------------------
// PPT: 1 slide = 1 question
// ---------------------------------------------
export async function exportFullSurveyPpt(
  filename = "survey-export.pptx"
) {
  const items = collectExportNodes();
  if (!items.length) throw new Error("Aucune question trouvée pour l’export");

  const Pptx = await loadPptxGen();
  const pres = new Pptx();

  pres.layout = "LAYOUT_16x9";
  pres.author = "Tada";
  pres.title = "Survey export";

  const slideW = 10; // inches (16:9)
  const slideH = 5.625;

  for (const item of items) {
    const slide = pres.addSlide();
    const img = await captureElement(item.element);

    // Titre
    slide.addText(item.title.slice(0, 120), {
      x: 0.5,
      y: 0.3,
      w: slideW - 1,
      h: 0.6,
      fontSize: 18,
      bold: true,
      align: "center",
      color: "363636",
    });

    // Image centrée
    const imgX = 0.5;
    const imgY = 1.1;
    const imgW = slideW - 1;
    const imgH = slideH - 1.6;

    slide.addImage({
      data: img,
      x: imgX,
      y: imgY,
      w: imgW,
      h: imgH,
      sizing: { type: "contain", w: imgW, h: imgH },
    });

    slide.addText(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, {
      x: 0.5,
      y: slideH - 0.35,
      w: slideW - 1,
      h: 0.3,
      fontSize: 8,
      color: "999999",
      align: "right",
    });
  }

  await pres.writeFile({ fileName: filename });
}
