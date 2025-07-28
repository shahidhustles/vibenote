"use client";

import { Id } from "@/convex/_generated/dataModel";
import Chatbox from "@/features/basic-functionality/components/chatbox";
import RightDrawer from "@/features/main/quiz/components/right-drawer";
import RightDock from "@/features/main/components/dock";
import { useState } from "react";
import FlashRightDrawer from "@/features/main/flashcard/components/flash-right-drawer";
import WhiteboardDrawer from "../whiteboard/components/whiteboard-drawer";

type NewChatPageClientProps = {
  chatId: Id<"chats">;
};

const NewChatPageClient = ({ chatId }: NewChatPageClientProps) => {
  const [quizDrawerOpen, setQuizDrawerOpen] = useState(false);
  const [flashcardDrawerOpen, setFlashcardDrawerOpen] = useState(false);
  const [whiteBoardOpen, setWhiteboardOpen] = useState(false);

  const handleQuizClick = () => {
    setQuizDrawerOpen(true);
  };

  const handleFlashCardsClick = () => {
    setFlashcardDrawerOpen(true);
  };

  const handleWhiteBoardClick = () => {
    setWhiteboardOpen(true);
  };

  const handleAITutorClick = () => {
    // TODO: Implement AI tutor drawer
    console.log("AI Tutor clicked");
  };

  return (
    <div className="w-full h-screen relative flex">
      <div className="flex-1">
        <Chatbox chatId={chatId} />
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50">
        <RightDock
          onQuizClick={handleQuizClick}
          onFlashCardsClick={handleFlashCardsClick}
          onWhiteBoardClick={handleWhiteBoardClick}
          onAITutorClick={handleAITutorClick}
        />
      </div>
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
        <RightDrawer
          chatId={chatId}
          open={quizDrawerOpen}
          onOpenChange={setQuizDrawerOpen}
        />
        <FlashRightDrawer
          chatId={chatId}
          open={flashcardDrawerOpen}
          onOpenChange={setFlashcardDrawerOpen}
        />
        <WhiteboardDrawer chatId={chatId} open={whiteBoardOpen} onOpenChange={setWhiteboardOpen} />
      </div>
    </div>
  );
};

export default NewChatPageClient;
