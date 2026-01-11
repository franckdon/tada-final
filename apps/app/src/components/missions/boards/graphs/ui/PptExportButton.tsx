// PptExportButton.tsx
"use client";

import PptxGenJS from "pptxgenjs";
import html2canvas from "html2canvas";

export function PptExportButton({
  chartRef,
  title,
  fileName,
}: {
  chartRef?: React.RefObject<HTMLDivElement>;
  title: string;
  fileName: string;
}) {
  const handleExportPPT = async () => {
    if (!chartRef?.current) return;
    const canvas = await html2canvas(chartRef.current);
    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();
    slide.addImage({ data: dataUrl, x: 0, y: 0, w: 10, h: 5.625 });

    pptx.writeFile({ fileName: fileName || `${title}.pptx` });
  };

  return <button onClick={handleExportPPT}>Exporter en PPT</button>;
}
