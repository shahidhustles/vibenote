"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Id } from "@/convex/_generated/dataModel";
import { useActionState, useEffect, useState } from "react";
import { generateFlashcards } from "../actions/generate-flashcards";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import FlashcardDialog from "./flashcard-dialog";

type FlashRightDrawerType = {
  chatId: Id<"chats">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const FlashRightDrawer = ({
  chatId,
  open,
  onOpenChange,
}: FlashRightDrawerType) => {
  const [state, formAction, isPending] = useActionState(generateFlashcards, {
    state: "idle",
  });
  const [showFlashcards, setShowFlashcards] = useState(false);

  // Query to get the flashcard deck for this chat
  const flashcardDeck = useQuery(api.flashcards.getFlashcardDeck, { chatId });

  // Open flashcard dialog when generation is completed
  useEffect(() => {
    if (state.state === "completed") {
      // Small delay to ensure the data is fetched
      const timer = setTimeout(() => {
        if (flashcardDeck?.flashcards && flashcardDeck.flashcards.length > 0) {
          setShowFlashcards(true);
          onOpenChange(false); // Close the drawer
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.state, flashcardDeck, onOpenChange]);
  return (
    <div className="flex-1">
      <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-full w-80 mt-0 rounded-none">
          <DrawerHeader>
            <DrawerTitle>Flashcards</DrawerTitle>
            <DrawerDescription>
              Generate flashcards to help reinforce your learning!
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 p-4 overflow-y-auto">
            <form action={formAction} className="space-y-6">
              {/* Hidden chatId field */}
              <input type="hidden" name="chatId" value={chatId} />

              {/* Number of Flashcards Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="numFlashcards"
                  className="text-sm font-medium text-gray-700"
                >
                  Number of Flashcards
                </Label>
                <Input
                  id="numFlashcards"
                  name="numFlashcards"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue={3}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Choose between 1-10 flashcards to generate
                </p>
              </div>

              {/* Enable Reminder Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="enableReminder"
                    className="text-sm font-medium text-gray-700"
                  >
                    Enable Reminder
                  </Label>
                  <Switch id="enableReminder" name="enableReminder" />
                </div>
                <p className="text-xs text-gray-500">
                  Save a calendar reminder in your Google Calendar to review
                  these flashcards later
                </p>
              </div>

              {/* Enable Hints Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="enableHints"
                    className="text-sm font-medium text-gray-700"
                  >
                    Enable Hints
                  </Label>
                  <Switch id="enableHints" name="enableHints" />
                </div>
                <p className="text-xs text-gray-500">
                  Include helpful hints on flashcards to guide your learning
                  process
                </p>
              </div>

              {/* Show loading/success/error states */}
              {state.state === "loading" && (
                <div className="text-blue-600 text-sm">
                  Generating flashcards...
                </div>
              )}
              {state.state === "completed" && (
                <div className="text-green-600 text-sm">{state.message}</div>
              )}
              {state.state === "error" && (
                <div className="text-red-600 text-sm">{state.message}</div>
              )}

              {/* Test button to open flashcards (temporary) */}
              {flashcardDeck?.flashcards &&
                flashcardDeck.flashcards.length > 0 && (
                  <Button
                    type="button"
                    onClick={() => setShowFlashcards(true)}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    View Existing Flashcards
                  </Button>
                )}

              {/* Generate Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
              >
                {isPending ? "Generating..." : "Generate Flashcards"}
              </Button>
            </form>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Flashcard Dialog */}
      <FlashcardDialog
        open={showFlashcards}
        onOpenChange={setShowFlashcards}
        flashcards={flashcardDeck?.flashcards || []}
      />
    </div>
  );
};

export default FlashRightDrawer;
