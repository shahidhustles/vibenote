import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { currentUser } from "@clerk/nextjs/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages } = await req.json();
  const headers = req.headers;
  const chatId = headers.get("id") as Id<"chats">;
  const user = await currentUser();

  if (!chatId || !user) {
    console.error("No ChatId or User Id found.");
  }

  // Check if this is the first message in the chat
  const existingMessagesCount = await convex.query(
    api.chats.getChatMessageCount,
    {
      chatId: chatId,
    }
  );

  const isFirstMessage = existingMessagesCount === 0;

  // Save user message to Convex
  const userMessage = messages[messages.length - 1];
  if (userMessage) {
    await convex.mutation(api.chats.addMessage, {
      content: userMessage.content,
      role: userMessage.role,
      chatId: chatId,
      userId: user!.id,
    });
  }

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: isFirstMessage
      ? "You are a helpful assistant. This is the start of a new conversation."
      : "You are a helpful assistant.",
    messages,
    onFinish: async (result) => {
      await convex.mutation(api.chats.addMessage, {
        content: result.text,
        role: "assistant",
        chatId: chatId,
        userId: user!.id,
      });
    },
  });

  if (isFirstMessage) {
    const { text: title } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Generate a short, concise title (maximum 5 words) for this conversation based on 
      the user's message. Only return the title, nothing else. User message: "${userMessage.content}"`,
    });
    await convex.mutation(api.chats.updateChatTitle, {
      chatId,
      title,
    });
  }
  return result.toDataStreamResponse();
}
