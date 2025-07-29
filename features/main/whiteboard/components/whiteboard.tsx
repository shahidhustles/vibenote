import { Tldraw, Editor, exportToBlob } from "tldraw";
import "tldraw/tldraw.css";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export interface WhiteboardRef {
  captureCanvas: () => Promise<string | null>;
}

type WhiteboardProps = {
  chatId: Id<"chats">;
  onCaptureSuccess?: () => void;
};

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(
  ({ chatId, onCaptureSuccess }, ref) => {
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
          reader.onload = async function () {
            const dataUrl = reader.result as string;

            // Send captured image directly to chat
            try {
              const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  id: chatId,
                },
                body: JSON.stringify({
                  messages: [
                    {
                      role: "user",
                      content:
                        "I've shared a whiteboard drawing with you. Please analyze and describe what you see.",
                    },
                  ],
                  data: {
                    imageUrl: dataUrl,
                  },
                }),
              });

              if (response.ok) {
                console.log("Whiteboard image sent to chat successfully");
                onCaptureSuccess?.();
              } else {
                console.error("Failed to send whiteboard image to chat");
              }
            } catch (error) {
              console.error("Error sending whiteboard image to chat:", error);
            }

            resolve(dataUrl);
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error capturing canvas:", error);
        return null;
      }
    };

    const handleCaptureClick = async () => {
      // Close the drawer immediately
      onCaptureSuccess?.();

      // Then capture and send to chat
      await captureCanvas();
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
          onClick={handleCaptureClick}
          className="absolute top-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white"
          size="sm"
        >
          <Camera className="w-4 h-4 mr-2" />
          Send to AI
        </Button>
      </div>
    );
  }
);

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
