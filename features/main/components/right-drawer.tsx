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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronLeft, Loader2 } from "lucide-react";
import { generateQuiz, type QuizState } from "../quiz/actions/actions";
import { useActionState, useState, useEffect } from "react";
import QuizContainer from "../quiz/components/quiz-container";

interface RightDrawerProps {
  chatId: Id<"chats">;
}

const initialState: QuizState = {
  state: "idle",
  toastNotification: "",
  quiz: [],
};

const RightDrawer = ({ chatId }: RightDrawerProps) => {
  const [state, formAction, isPending] = useActionState(
    generateQuiz,
    initialState
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [showingResults, setShowingResults] = useState(false);

  // Update showQuiz when state changes to completed
  useEffect(() => {
    if (state.state === "completed" && state.quiz.length > 0) {
      setShowQuiz(true);
    } else if (state.state === "idle") {
      // Reset showQuiz when state goes back to idle (in case of errors or other resets)
      setShowQuiz(false);
    }
  }, [state.state, state.quiz.length]);

  const resetQuiz = () => {
    // Reset to show the form again and clear any loading states
    setShowQuiz(false);
    setShowingResults(false);
  };

  const renderQuizContent = () => {
    // Show loading state
    if (state.state === "loading") {
      return (
        <div className="p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Generating your quiz...</p>
        </div>
      );
    }

    // Show error state
    if (state.state === "error") {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {state.error || "An error occurred"}
          </p>
        </div>
      );
    }

    // Show quiz when completed and showQuiz is true
    if (showQuiz && state.quiz.length > 0) {
      return (
        <QuizContainer
          questions={state.quiz}
          onResultsShow={setShowingResults}
        />
      );
    }

    // Default: return null (form will show)
    return null;
  };

  return (
    <div className="flex-1">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative right-0 ml-auto z-50 p-2 h-12 w-8 rounded-l-lg 
            rounded-r-none border-r-0 bg-white shadow-lg hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full w-80 mt-0 rounded-none">
          <DrawerHeader>
            <DrawerTitle>Quiz Section</DrawerTitle>
            <DrawerDescription>
              Generate Quiz for the learning you just did!!
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Quiz Form - show when idle or when quiz is completed but we want to show form again */}
            {(state.state === "idle" ||
              (state.state === "completed" && !showQuiz && !isPending)) && (
              <form action={formAction} className="space-y-6">
                {/* Quiz Title Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Quiz Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter quiz title..."
                    className="w-full"
                    required
                  />
                </div>

                {/* Number of Questions Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="questions"
                    className="text-sm font-medium text-gray-700"
                  >
                    Number of Questions
                  </Label>
                  <Input
                    id="questions"
                    name="questions"
                    type="number"
                    placeholder="5"
                    min="1"
                    max="20"
                    className="w-full"
                    defaultValue="5"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Choose between 1-20 questions
                  </p>
                </div>

                {/* Hidden input for chatId */}
                <input type="hidden" name="chatId" value={chatId} />

                {/* Generate Button */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Quiz...
                    </>
                  ) : (
                    "Generate Quiz"
                  )}
                </Button>
              </form>
            )}

            {/* Quiz Results */}
            {renderQuizContent()}
          </div>
          <DrawerFooter>
            {showQuiz && showingResults && (
              <Button onClick={resetQuiz} variant="outline" className="mb-2">
                Generate New Quiz
              </Button>
            )}
            <Button className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white">
              Generate Flash Cards
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default RightDrawer;
