import { Tldraw, Editor, exportToBlob } from "tldraw";
import "tldraw/tldraw.css";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export interface WhiteboardRef {
  captureCanvas: () => Promise<string | null>;
}

const Whiteboard = forwardRef<WhiteboardRef>((props, ref) => {
  const editorRef = useRef<Editor | null>(null);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
  };

  const captureCanvas = async (): Promise<string | null> => {
    if (!editorRef.current) {
      console.error("Editor not available");
      return null;
    }

    try {
      // Get all shape IDs on current page
      const shapeIds = editorRef.current.getCurrentPageShapeIds();

      // Export as PNG blob
      const blob = await exportToBlob({
        editor: editorRef.current,
        ids: Array.from(shapeIds),
        format: "png",
        opts: {
          background: true,
          bounds:
            editorRef.current.getSelectionPageBounds() ||
            editorRef.current.getCurrentPageBounds(),
          padding: 16,
          scale: 1,
        },
      });

      // Convert blob to data URL
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
          const dataUrl = reader.result as string;

          // Log the raw data URL
          console.log("Raw Canvas Data URL:", dataUrl);

          // Copy to clipboard
          navigator.clipboard
            .writeText(dataUrl)
            .then(() => {
              console.log("Data URL copied to clipboard!");
            })
            .catch((err) => {
              console.error("Failed to copy to clipboard:", err);
            });

          resolve(dataUrl);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error capturing canvas:", error);
      return null;
    }
  };

  // Expose the captureCanvas function to parent components
  useImperativeHandle(ref, () => ({
    captureCanvas,
  }));

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Tldraw onMount={handleMount} />

      {/* Capture Button */}
      <Button
        onClick={captureCanvas}
        className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white"
        size="sm"
      >
        <Camera className="w-4 h-4 mr-2" />
        Capture Canvas
      </Button>
    </div>
  );
});

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
