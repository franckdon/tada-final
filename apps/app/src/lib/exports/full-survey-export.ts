"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const loadPptxGen = async () => {
  const PptxGenJS = await import("pptxgenjs");
  return (PptxGenJS as any).default || (PptxGenJS as any);
};

type ExportNode = {
  id: string;
  title: string;
  element: HTMLElement;
};

const TADA_RED = "#FF5B4A";
const LOGO_PATH = "/logo-white.png";
const TEMPLATE_IMAGE_PATH = "/image-template.png";

const PPT_TEMPLATE_SIZE = { width: 1600, height: 900 };
const PDF_TEMPLATE_SIZE = { width: 1414, height: 1000 };

type ImageSize = {
  width: number;
  height: number;
};

type BrandAssets = {
  logoDataUrl: string;
  templateImageDataUrl: string;
  logoSize: ImageSize;
  templateSize: ImageSize;
};

type CanvasSize = {
  width: number;
  height: number;
};

export function collectExportNodes(): ExportNode[] {
  const selectors = [
    '[data-export-question="true"]',
    "[data-export-id]",
    "[data-question-key]",
  ].join(", ");

  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selectors));

  return nodes
    .map((el) => {
      const id =
        el.getAttribute("data-export-id") ||
        el.getAttribute("data-question-key") ||
        el.getAttribute("id") ||
        "question";

      const title =
        el.getAttribute("data-export-title") ||
        el.querySelector("h1, h2, h3, h4")?.textContent?.trim() ||
        el.getAttribute("data-question-key") ||
        id;

      return { id, title, element: el };
    })
    .filter((x) => !!x.element);
}

function hideNonExportables(root: HTMLElement) {
  const els = Array.from(root.querySelectorAll<HTMLElement>(".non-exportable"));
  const previous = els.map((el) => ({ el, display: el.style.display }));

  els.forEach((el) => {
    el.style.display = "none";
  });

  return () => {
    previous.forEach(({ el, display }) => {
      el.style.display = display;
    });
  };
}

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
      windowWidth: Math.ceil(rect.width),
      windowHeight: Math.ceil(rect.height),
      scrollX: 0,
      scrollY: 0,
    });

    return canvas.toDataURL("image/png");
  } finally {
    restore();
  }
}

async function fetchAssetAsDataUrl(path: string): Promise<string> {
  const res = await fetch(path, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Impossible de charger l’asset: ${path}`);
  }

  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function sanitizeTitle(title?: string) {
  if (!title) return "Nom de l’étude";
  const clean = title.trim();
  return clean.length ? clean : "Nom de l’étude";
}

function getCurrentYearLabel() {
  return String(new Date().getFullYear());
}

function fitContain(
  sourceWidth: number,
  sourceHeight: number,
  boxWidth: number,
  boxHeight: number,
) {
  const ratio = sourceWidth / sourceHeight;
  let width = boxWidth;
  let height = width / ratio;

  if (height > boxHeight) {
    height = boxHeight;
    width = height * ratio;
  }

  return { width, height };
}

function getImageDimensionsFromDataUrl(dataUrl: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function loadBrandAssets(): Promise<BrandAssets> {
  const [logoDataUrl, templateImageDataUrl] = await Promise.all([
    fetchAssetAsDataUrl(LOGO_PATH),
    fetchAssetAsDataUrl(TEMPLATE_IMAGE_PATH),
  ]);

  const [logoSize, templateSize] = await Promise.all([
    getImageDimensionsFromDataUrl(logoDataUrl),
    getImageDimensionsFromDataUrl(templateImageDataUrl),
  ]);

  return {
    logoDataUrl,
    templateImageDataUrl,
    logoSize,
    templateSize,
  };
}

function waitForImagesToLoad(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));

  if (!images.length) return Promise.resolve();

  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  ).then(() => undefined);
}

async function waitForFonts(): Promise<void> {
  const fontSet = (document as Document & {
    fonts?: { ready?: Promise<unknown> };
  }).fonts;

  if (fontSet?.ready) {
    await fontSet.ready;
  }
}

async function captureStandaloneNode(
  node: HTMLElement,
  options?: {
    backgroundColor?: string;
    width?: number;
    height?: number;
  },
) {
  const width = options?.width ?? PPT_TEMPLATE_SIZE.width;
  const height = options?.height ?? PPT_TEMPLATE_SIZE.height;

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-20000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.zIndex = "-1";
  wrapper.style.pointerEvents = "none";
  wrapper.style.background = options?.backgroundColor ?? "#ffffff";

  wrapper.appendChild(node);
  document.body.appendChild(wrapper);

  try {
    await waitForFonts();
    await waitForImagesToLoad(wrapper);

    const canvas = await html2canvas(wrapper, {
      useCORS: true,
      scale: 2,
      backgroundColor: options?.backgroundColor ?? "#ffffff",
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    });

    return canvas.toDataURL("image/png");
  } finally {
    document.body.removeChild(wrapper);
  }
}

function px(value: number) {
  return `${Math.round(value)}px`;
}

function buildCoverNode(options: {
  studyTitle: string;
  yearLabel: string;
  assets: BrandAssets;
  size: CanvasSize;
}) {
  const { studyTitle, yearLabel, assets, size } = options;
  const { width, height } = size;

  const root = document.createElement("div");
  root.style.width = px(width);
  root.style.height = px(height);
  root.style.background = TADA_RED;
  root.style.position = "relative";
  root.style.overflow = "hidden";
  root.style.fontFamily = "var(--font-sora), sans-serif";
  root.style.color = "#FFFFFF";

  const logo = document.createElement("img");
  logo.src = assets.logoDataUrl;
  logo.alt = "Tada";
  logo.style.position = "absolute";
  logo.style.left = px(width * 0.03);
  logo.style.top = px(height * 0.04);
  logo.style.width = px(width * 0.11);
  logo.style.height = "auto";
  logo.style.objectFit = "contain";

  const title = document.createElement("div");
  title.textContent = studyTitle;
  title.style.position = "absolute";
  title.style.left = px(width * 0.03);
  title.style.top = px(height * 0.19);
  title.style.width = px(width * 0.46);
  title.style.fontFamily = "var(--font-sora), sans-serif";
  title.style.fontWeight = "700";
  title.style.fontSize = px(height * 0.095);
  title.style.lineHeight = "1.12";
  title.style.letterSpacing = "0";
  title.style.fontKerning = "normal";
  title.style.fontStretch = "normal";
  title.style.textRendering = "optimizeLegibility";
  title.style.whiteSpace = "pre-wrap";
  title.style.wordBreak = "break-word";

  const year = document.createElement("div");
  year.textContent = yearLabel;
  year.style.position = "absolute";
  year.style.left = px(width * 0.03);
  year.style.top = px(height * 0.84);
  year.style.fontFamily = "var(--font-sora), sans-serif";
  year.style.fontWeight = "400";
  year.style.fontSize = px(height * 0.029);
  year.style.lineHeight = "1";
  year.style.letterSpacing = "0";
  year.style.fontKerning = "normal";
  year.style.fontStretch = "normal";
  year.style.textRendering = "optimizeLegibility";

  const circle = document.createElement("div");
  circle.style.position = "absolute";
  circle.style.right = px(width * 0.11);
  circle.style.top = px(height * 0.25);
  circle.style.width = px(width * 0.26);
  circle.style.height = px(width * 0.26);
  circle.style.borderRadius = "9999px";
  circle.style.background = "#F2F2F2";
  circle.style.display = "flex";
  circle.style.alignItems = "center";
  circle.style.justifyContent = "center";

  const templateImage = document.createElement("img");
  templateImage.src = assets.templateImageDataUrl;
  templateImage.alt = "Template";
  templateImage.style.width = px(width * 0.19);
  templateImage.style.height = px(width * 0.19);
  templateImage.style.objectFit = "contain";

  circle.appendChild(templateImage);
  root.appendChild(logo);
  root.appendChild(title);
  root.appendChild(year);
  root.appendChild(circle);

  return root;
}

function buildClosingNode(options: {
  assets: BrandAssets;
  size: CanvasSize;
}) {
  const { assets, size } = options;
  const { width, height } = size;

  const root = document.createElement("div");
  root.style.width = px(width);
  root.style.height = px(height);
  root.style.background = TADA_RED;
  root.style.position = "relative";
  root.style.overflow = "hidden";
  root.style.fontFamily = "var(--font-sora), sans-serif";
  root.style.color = "#FFFFFF";

  const text = document.createElement("div");
  text.textContent = "Teams make\nbetter decisions\nwith Tada";
  text.style.position = "absolute";
  text.style.left = px(width * 0.05);
  text.style.top = px(height * 0.12);
  text.style.width = px(width * 0.44);
  text.style.whiteSpace = "pre-line";
  text.style.fontFamily = "var(--font-sora), sans-serif";
  text.style.fontWeight = "700";
  text.style.fontSize = px(height * 0.087);
  text.style.lineHeight = "1.15";
  text.style.letterSpacing = "0";
  text.style.fontKerning = "normal";
  text.style.fontStretch = "normal";
  text.style.textRendering = "optimizeLegibility";

  const logo = document.createElement("img");
  logo.src = assets.logoDataUrl;
  logo.alt = "Tada";
  logo.style.position = "absolute";
  logo.style.left = px(width * 0.045);
  logo.style.bottom = px(height * 0.06);
  logo.style.width = px(width * 0.1);
  logo.style.height = "auto";
  logo.style.objectFit = "contain";

  root.appendChild(text);
  root.appendChild(logo);

  return root;
}

async function generateTemplateImages(options: {
  studyTitle: string;
  yearLabel: string;
  assets: BrandAssets;
  size: CanvasSize;
}) {
  const coverNode = buildCoverNode(options);
  const closingNode = buildClosingNode({
    assets: options.assets,
    size: options.size,
  });

  const [coverDataUrl, closingDataUrl] = await Promise.all([
    captureStandaloneNode(coverNode, {
      backgroundColor: TADA_RED,
      width: options.size.width,
      height: options.size.height,
    }),
    captureStandaloneNode(closingNode, {
      backgroundColor: TADA_RED,
      width: options.size.width,
      height: options.size.height,
    }),
  ]);

  return { coverDataUrl, closingDataUrl };
}

/* -------------------------------------------------------------------------- */
/*                                   PDF                                      */
/* -------------------------------------------------------------------------- */

function addPdfFullPageImage(pdf: jsPDF, img: string) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  pdf.addImage(img, "PNG", 0, 0, pageW, pageH);
}

function addPdfQuestionPage(
  pdf: jsPDF,
  options: {
    title: string;
    img: string;
    assets: BrandAssets;
  },
) {
  const { title, img, assets } = options;
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  pdf.setFillColor("#FFFFFF");
  pdf.rect(0, 0, pageW, pageH, "F");

  const logoContain = fitContain(
    assets.logoSize.width,
    assets.logoSize.height,
    22,
    8,
  );

  pdf.addImage(
    assets.logoDataUrl,
    "PNG",
    12,
    10,
    logoContain.width,
    logoContain.height,
  );

  pdf.setTextColor(TADA_RED);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  const titleLines = pdf.splitTextToSize(title.slice(0, 220), pageW - 24);
  pdf.text(titleLines, 12, 26);

  const titleBlockHeight = Math.max(titleLines.length * 7, 10);
  const topY = 32 + titleBlockHeight;

  const margin = 12;
  const availableW = pageW - margin * 2;
  const availableH = pageH - topY - 18;

  const imgProps = pdf.getImageProperties(img);
  const contain = fitContain(
    imgProps.width,
    imgProps.height,
    availableW,
    availableH,
  );

  const x = (pageW - contain.width) / 2;
  const y = topY + (availableH - contain.height) / 2;

  pdf.addImage(img, "PNG", x, y, contain.width, contain.height);

  pdf.setDrawColor("#F1F5F9");
  pdf.line(12, pageH - 12, pageW - 12, pageH - 12);

  pdf.setTextColor("#94A3B8");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString("fr-FR")}`,
    pageW - 12,
    pageH - 8,
    {
      align: "right",
    },
  );
}

export async function exportFullSurveyPdf(
  filename = "survey-export.pdf",
  options?: {
    studyTitle?: string;
    yearLabel?: string;
  },
) {
  const items = collectExportNodes();
  if (!items.length) {
    throw new Error("Aucune question trouvée pour l’export");
  }

  const studyTitle = sanitizeTitle(options?.studyTitle);
  const yearLabel = options?.yearLabel ?? getCurrentYearLabel();
  const assets = await loadBrandAssets();

  const { coverDataUrl, closingDataUrl } = await generateTemplateImages({
    studyTitle,
    yearLabel,
    assets,
    size: PDF_TEMPLATE_SIZE,
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  addPdfFullPageImage(pdf, coverDataUrl);

  for (const item of items) {
    const img = await captureElement(item.element);
    pdf.addPage();

    addPdfQuestionPage(pdf, {
      title: item.title,
      img,
      assets,
    });
  }

  pdf.addPage();
  addPdfFullPageImage(pdf, closingDataUrl);

  pdf.save(filename);
}

/* -------------------------------------------------------------------------- */
/*                                    PPT                                     */
/* -------------------------------------------------------------------------- */

function addPptFullSlideImage(slide: any, img: string) {
  slide.addImage({
    data: img,
    x: 0,
    y: 0,
    w: 10,
    h: 5.625,
  });
}

function addPptQuestionSlide(
  slide: any,
  options: {
    title: string;
    img: string;
    assets: BrandAssets;
  },
) {
  const { title, img, assets } = options;

  slide.background = { color: "FFFFFF" };

  const logoContain = fitContain(
    assets.logoSize.width,
    assets.logoSize.height,
    1.5,
    0.58,
  );

  slide.addImage({
    data: assets.logoDataUrl,
    x: 0.45,
    y: 0.22,
    w: logoContain.width,
    h: logoContain.height,
  });

  slide.addText(title.slice(0, 220), {
    x: 0.45,
    y: 0.78,
    w: 8.6,
    h: 0.7,
    fontFace: "Aptos",
    bold: true,
    fontSize: 20,
    color: "FF5B4A",
    margin: 0,
    fit: "shrink",
  });

  slide.addImage({
    data: img,
    x: 0.45,
    y: 1.4,
    w: 8.6,
    h: 3.7,
    sizing: {
      type: "contain",
      x: 0.45,
      y: 1.4,
      w: 8.6,
      h: 3.7,
    },
  });

  slide.addText(`Generated on ${new Date().toLocaleDateString("fr-FR")}`, {
    x: 6.5,
    y: 5.18,
    w: 2.55,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8,
    color: "94A3B8",
    align: "right",
    margin: 0,
  });
}

export async function exportFullSurveyPpt(
  filename = "survey-export.pptx",
  options?: {
    studyTitle?: string;
    yearLabel?: string;
  },
) {
  const items = collectExportNodes();
  if (!items.length) {
    throw new Error("Aucune question trouvée pour l’export");
  }

  const studyTitle = sanitizeTitle(options?.studyTitle);
  const yearLabel = options?.yearLabel ?? getCurrentYearLabel();
  const assets = await loadBrandAssets();

  const { coverDataUrl, closingDataUrl } = await generateTemplateImages({
    studyTitle,
    yearLabel,
    assets,
    size: PPT_TEMPLATE_SIZE,
  });

  const Pptx = await loadPptxGen();
  const pres = new Pptx();

  pres.layout = "LAYOUT_16x9";
  pres.author = "Tada";
  pres.company = "Tada";
  pres.subject = "Survey export";
  pres.title = studyTitle;
  pres.lang = "fr-FR";
  pres.theme = {
    headFontFace: "Aptos",
    bodyFontFace: "Aptos",
    lang: "fr-FR",
  };

  const coverSlide = pres.addSlide();
  addPptFullSlideImage(coverSlide, coverDataUrl);

  for (const item of items) {
    const slide = pres.addSlide();
    const img = await captureElement(item.element);

    addPptQuestionSlide(slide, {
      title: item.title,
      img,
      assets,
    });
  }

  const closingSlide = pres.addSlide();
  addPptFullSlideImage(closingSlide, closingDataUrl);

  await pres.writeFile({ fileName: filename });
}