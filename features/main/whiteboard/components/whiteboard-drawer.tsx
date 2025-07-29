import { Id } from "@/convex/_generated/dataModel";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import Whiteboard, { WhiteboardRef } from "./whiteboard";
import { forwardRef } from "react";

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
