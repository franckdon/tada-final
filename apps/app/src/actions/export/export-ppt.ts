// "use server";

// import PptxGenJS from "pptxgenjs";

// export async function exportChartToPpt(imageData: string, questionId: string) {
//   try {
//     const pptx = new PptxGenJS();
//     const slide = pptx.addSlide();

//     // Add image to slide
//     slide.addImage({
//       data: imageData,
//       x: 0.5, // x position in inches
//       y: 0.5, // y position in inches
//       w: 9, // width in inches (standard slide width is 10 inches)
//       h: 5, // height in inches (standard slide height is 7.5 inches)
//       sizing: { type: "contain", w: 9, h: 5 }, // Adjust sizing to fit
//     });

//     // Generate the PPTX as a Blob and convert to ArrayBuffer
//     const buffer = await pptx.write({ outputType: "arraybuffer" });
//     // Convert ArrayBuffer to Uint8Array for serialization
//     return new Uint8Array(buffer as any);
//   } catch (error) {
//     console.error("Error generating PPTX on server:", error);
//     throw new Error("Failed to generate PowerPoint file.");
//   }
// }

"use server";

import PptxGenJS from "pptxgenjs";

export async function exportChartToPpt(imageData: string, questionId: string) {
  try {
    const pptx = new PptxGenJS();
    const slide = pptx.addSlide();

    // Add a title to the slide for better context and to test basic PPTX functionality
    slide.addText(`Chart for Question ID: ${questionId || "N/A"}`, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      align: pptx.AlignH.center,
    });

    // Add image to slide
    slide.addImage({
      data: imageData,
      x: 0.5, // x position in inches
      y: 0.8, // Adjusted y position to make space for the title
      w: 9, // width in inches (standard slide width is 10 inches)
      h: 5, // height in inches (standard slide height is 7.5 inches)
      sizing: { type: "contain", w: 9, h: 5 }, // Adjust sizing to fit
    });

    // Generate the PPTX as a Blob and convert to ArrayBuffer
    const buffer = await pptx.write("arraybuffer" as any);
    // Convert ArrayBuffer to Uint8Array for serialization
    return new Uint8Array(buffer as any);
  } catch (error) {
    console.error("Error generating PPTX on server:", error);
    throw new Error("Failed to generate PowerPoint file.");
  }
}
