import { Id } from "@/convex/_generated/dataModel";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { forwardRef } from "react";
import dynamic from "next/dynamic";

// Import the type separately for TypeScript
import type { WhiteboardRef } from "./whiteboard";

// Dynamically import the Whiteboard component to prevent SSR issues
const Whiteboard = dynamic(() => import("./whiteboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      Loading whiteboard...
    </div>
  ),
});

type WhiteboardDrawerType = {
  chatId: Id<"chats">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const WhiteboardDrawer = forwardRef<WhiteboardRef, WhiteboardDrawerType>(
  ({ chatId, open, onOpenChange }, ref) => {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="!w-[30vw] h-full max-w-none sm:!max-w-none">
          <DrawerHeader>
            <DrawerTitle>Whiteboard</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <Whiteboard
              ref={ref}
              chatId={chatId}
              onCaptureSuccess={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
);

WhiteboardDrawer.displayName = "WhiteboardDrawer";

export default WhiteboardDrawer;
