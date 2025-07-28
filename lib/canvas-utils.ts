import { Editor, exportToBlob } from "tldraw";

/**
 * Captures the canvas from a tldraw editor and returns the raw data URL
 * @param editor - The tldraw editor instance
 * @returns Promise<string | null> - The data URL string or null if failed
 */
export async function captureCanvasDataUrl(
  editor: Editor
): Promise<string | null> {
  if (!editor) {
    console.error("Editor not available");
    return null;
  }

  try {
    // Get all shape IDs on current page
    const shapeIds = editor.getCurrentPageShapeIds();

    // Export as PNG blob
    const blob = await exportToBlob({
      editor,
      ids: Array.from(shapeIds),
      format: "png",
      opts: {
        background: true,
        bounds:
          editor.getSelectionPageBounds() || editor.getCurrentPageBounds(),
        padding: 16,
        scale: 1,
      },
    });

    // Convert blob to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result as string;
        console.log(
          "Canvas captured successfully. Data URL length:",
          dataUrl.length
        );
        resolve(dataUrl);
      };
      reader.onerror = function () {
        reject(new Error("Failed to read blob as data URL"));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error capturing canvas:", error);
    return null;
  }
}

/**
 * Utility function to decode a data URL and get basic info
 * @param dataUrl - The data URL to decode
 * @returns Object with mime type and base64 data
 */
export function decodeDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid data URL format");
  }

  return {
    mimeType: matches[1],
    base64Data: matches[2],
    size: matches[2].length,
    estimatedFileSizeKB: Math.round((matches[2].length * 3) / 4 / 1024),
  };
}
