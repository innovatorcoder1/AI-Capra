import pptxgen from "pptxgenjs";

/**
 * Generates a .pptx file in the browser from structured presentation data.
 * @param {Object} presentationData - The structured data from backend
 */
export async function generatePPT(presentationData) {
  if (!presentationData || !presentationData.slides || !Array.isArray(presentationData.slides)) {
    console.error("Invalid presentation data provided.");
    return;
  }

  // 1. Initialize pptxgen
  const pres = new pptxgen();

  // Basic styling
  const isBlueTheme = presentationData.theme === "modern_blue";
  const bgColor = isBlueTheme ? "0F172A" : "FFFFFF"; 
  const textColor = isBlueTheme ? "FFFFFF" : "333333";
  const accentColor = isBlueTheme ? "3B82F6" : "2563EB";

  // 2. Add slides
  for (const slideData of presentationData.slides) {
    const slide = pres.addSlide();
    slide.background = { color: bgColor };

    const layout = slideData.layout || "text_center";
    const titleText = slideData.title || "";
    
    // Max 5 bullets as per rules
    const rawBullets = Array.isArray(slideData.bullets) ? slideData.bullets : [];
    const bullets = rawBullets.slice(0, 5);
    
    const hasImage = slideData.image && slideData.image.url;
    const imageUrl = hasImage ? slideData.image.url : null;

    // Apply specific layouts
    switch (layout) {
      case "hero_center":
        // Centered title slide
        slide.addText(titleText, {
          x: 1, y: 1.5, w: 8, h: 2,
          fontSize: 44,
          bold: true,
          color: accentColor,
          align: "center",
          valign: "middle"
        });
        
        if (bullets.length > 0) {
          slide.addText(bullets.join("\n"), {
            x: 1, y: 4, w: 8, h: 1.5,
            fontSize: 24,
            color: textColor,
            align: "center"
          });
        }
        break;

      case "text_left_image_right":
        // Split layout (text left, image right)
        slide.addText(titleText, {
          x: 0.5, y: 0.5, w: 4.5, h: 1,
          fontSize: 32,
          bold: true,
          color: accentColor
        });

        if (bullets.length > 0) {
          const bulletObjects = bullets.map(text => ({ text, options: { bullet: true } }));
          slide.addText(bulletObjects, {
            x: 0.5, y: 1.8, w: 4.5, h: 3.5,
            fontSize: 18,
            color: textColor,
            valign: "top"
          });
        }

        if (imageUrl) {
          slide.addImage({
            path: imageUrl,
            x: 5.5, y: 1, w: 4, h: 4,
            sizing: { type: "contain", w: 4, h: 4 }
          });
        }
        break;

      case "minimal_center":
        // Simple final slide
        slide.addText(titleText, {
          x: 1, y: 2, w: 8, h: 1.5,
          fontSize: 36,
          color: textColor,
          align: "center",
          valign: "middle"
        });
        
        if (bullets.length > 0) {
          slide.addText(bullets.join("\n"), {
            x: 1, y: 4, w: 8, h: 1,
            fontSize: 20,
            color: textColor,
            align: "center"
          });
        }
        break;

      case "text_center":
      default:
        // Centered text slide
        slide.addText(titleText, {
          x: 0.5, y: 0.5, w: 9, h: 1,
          fontSize: 32,
          bold: true,
          color: accentColor,
          align: "center"
        });

        if (bullets.length > 0) {
          const bulletObjects = bullets.map(text => ({ text, options: { bullet: true } }));
          slide.addText(bulletObjects, {
            x: 1, y: 1.8, w: 8, h: 3.5,
            fontSize: 20,
            color: textColor,
            valign: "top",
            align: "left"
          });
        }
        break;
    }

    // Add speaker notes if present
    if (slideData.speaker_notes) {
      slide.addNotes(slideData.speaker_notes);
    }
  }

  // 3. Generate and download the presentation file
  try {
    await pres.writeFile({ fileName: "presentation.pptx" });
  } catch (error) {
    console.error("Failed to generate PPTX file:", error);
  }
}
