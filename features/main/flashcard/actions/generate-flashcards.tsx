"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { currentUser } from "@clerk/nextjs/server";
import { generateObject } from "ai";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import z from "zod";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ActionState = {
  state: "idle" | "loading" | "completed" | "error";
  message?: string;
};

const flashcardSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      hint: z.string().optional(),
    })
  ),
});

export const generateFlashcards = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    // Immediately return loading state
    const user = await currentUser();
    if (!user) {
      return { state: "error", message: "User not authenticated" };
    }

    const numFlashcards =
      parseInt(formData.get("numFlashcards") as string) || 3;
    const enableHints = formData.get("enableHints") === "on";
    const chatId = formData.get("chatId") as Id<"chats">;

    if (!chatId) {
      return { state: "error", message: "Chat ID is required" };
    }

    // Get chat messages for context
    const messages = await convex.query(api.chats.getChatMessages, { chatId });
    const chatContext = messages
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role}: ${msg.content}`
      )
      .join("\n");

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `Based on the following chat conversation, generate ${numFlashcards} educational flashcards. ${
      enableHints
        ? "Include helpful hints for each flashcard."
        : "Do not include hints."
    }

Chat conversation:
${chatContext}

Create flashcards that test understanding of the key concepts discussed.`;

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: flashcardSchema,
      prompt,
    });

    // Save flashcards to Convex
    await convex.mutation(api.flashcards.createOrUpdateFlashcardDeck, {
      chatId,
      userId: user.id,
      flashcards: object.flashcards,
    });

    return {
      state: "completed",
      message: "Flashcards generated successfully!",
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return { state: "error", message: "Failed to generate flashcards" };
  }
};
