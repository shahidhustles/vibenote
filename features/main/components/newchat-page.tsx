"use client";

import { Id } from "@/convex/_generated/dataModel";
import Chatbox from "@/features/basic-functionality/components/chatbox";
import RightDrawer from "@/features/main/quiz/components/right-drawer";
import RightDock from "@/features/main/components/dock";
import { useState } from "react";
import FlashRightDrawer from "@/features/main/flashcard/components/flash-right-drawer";

type NewChatPageClientProps = {
  chatId: Id<"chats">;
};

const NewChatPageClient = ({ chatId }: NewChatPageClientProps) => {
  const [quizDrawerOpen, setQuizDrawerOpen] = useState(false);
  const [flashcardDrawerOpen, setFlashcardDrawerOpen] = useState(false);

  const handleQuizClick = () => {
    setQuizDrawerOpen(true);
  };

  const handleFlashCardsClick = () => {
    setFlashcardDrawerOpen(true);
  };

  const handleWhiteBoardClick = () => {
    // TODO: Implement whiteboard drawer
    console.log("Whiteboard clicked");
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
      </div>
    </div>
  );
};

export default NewChatPageClient;
