"use server";
import { createGroq } from "@ai-sdk/groq";
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import z from "zod";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export type QuizQuestion = {
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: "a" | "b" | "c" | "d";
  solution: string;
};

export type QuizState = {
  state: "idle" | "loading" | "completed" | "error";
  toastNotification: string;
  quiz: QuizQuestion[];
  error?: string;
};

export const generateQuiz = async (
  prevState: QuizState,
  formData: FormData
): Promise<QuizState> => {
  try {
    // Set loading state immediately
    const newState: QuizState = {
      ...prevState,
      state: "loading",
      error: undefined,
    };

    const title = formData.get("title") as string;
    const questions = formData.get("questions") as string;
    const chatId = formData.get("chatId") as Id<"chats">;

    if (!title || !questions || !chatId) {
      return {
        ...newState,
        state: "error",
        error: "Missing required fields",
        toastNotification: "Please fill all required fields",
      };
    }

    // Get chat messages to understand the context
    const messages = await convex.query(api.chats.getChatMessages, { chatId });

    if (!messages || messages.length === 0) {
      return {
        ...newState,
        state: "error",
        error: "No chat content found",
        toastNotification: "No chat content available to generate quiz from",
      };
    }

    // Extract content from messages for context
    const chatContent = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // const google = createGoogleGenerativeAI({
    //   apiKey: process.env.GEMINI_API_KEY,
    // });

    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { object } = await generateObject({
      // model: google("gemini-1.5-flash"),
      model : groq("llama-3.1-8b-instant"),
      prompt: `Based on the following chat conversation, generate a quiz titled "${title}" with ${questions} questions. 
      
      Chat Context:
      ${chatContent}
      
      Create multiple choice questions based on the key concepts, facts, and learning points discussed in this conversation. Make sure the questions test understanding and knowledge retention of the main topics covered.`,

      schema: z.object({
        quiz: z
          .array(
            z.object({
              question: z.string().describe("The quiz question"),
              options: z
                .object({
                  a: z.string().describe("Option A"),
                  b: z.string().describe("Option B"),
                  c: z.string().describe("Option C"),
                  d: z.string().describe("Option D"),
                })
                .describe("Four multiple choice options"),
              correctAnswer: z
                .enum(["a", "b", "c", "d"])
                .describe("The correct answer (a, b, c, or d)"),
              solution: z
                .string()
                .describe(
                  "A sentence explaining why this is the correct answer"
                ),
            })
          )
          .length(parseInt(questions))
          .describe(`Array of exactly ${questions} quiz questions`),
      }),
    });

    return {
      state: "completed",
      toastNotification: "Quiz Successfully Generated!",
      quiz: object.quiz,
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      state: "error",
      toastNotification: "Failed to generate quiz. Please try again.",
      quiz: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
