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
  const { messages, data } = await req.json();
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

  // Save user message to Convex (we'll handle image upload after streaming)
  const userMessage = messages[messages.length - 1];
  let userMessageId: Id<"messages"> | null = null;

  if (userMessage) {
    // Clean the content by removing image attachment information for storage
    const cleanContent = userMessage.content.replace(
      /\n\n\[Images attached:.*?\]$/,
      ""
    );

    // Save the text content to Convex first
    userMessageId = await convex.mutation(api.chats.addMessage, {
      content: cleanContent,
      role: userMessage.role,
      chatId: chatId,
      userId: user!.id,
    });
  }

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: `You are VibeNote AI, an intelligent learning assistant designed for students studying Physics, Chemistry, Mathematics (PCM) and Computer Science. 

Your primary role is to help students learn through interactive features:

🧠 **Quiz Generation**: Create targeted quizzes based on our conversation to test understanding
📚 **Flashcards**: Generate spaced repetition flashcards in ANKI style with Google Calendar reminders
🎨 **Whiteboard Analysis**: When users share whiteboard drawings, analyze their work and provide feedback

**Key Capabilities:**
- Explain complex PCM and CS concepts clearly
- Break down problems step-by-step
- Create practice questions and flashcards
- Analyze hand-drawn diagrams and solutions
- Provide constructive feedback on student work

**When users mention:**
- "What's on my whiteboard" or similar - they're sharing a drawing/diagram they created
- Quiz requests - generate relevant questions based on our discussion
- Flashcard requests - create memorable study cards with SRS scheduling

Be encouraging, clear, and focus on helping students truly understand concepts rather than just memorizing them.`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: messages.map((msg: any) => {
      // Handle the last message (user message) differently if it has image data
      if (msg === userMessage && data?.imageUrl) {
        return {
          role: msg.role,
          content: [
            {
              type: "text",
              text: msg.content.replace(/\n\n\[Images attached:.*?\]$/, ""),
            },
            {
              type: "image",
              image: data.imageUrl, // This should be a base64 data URL
            },
          ],
        };
      }
      return msg;
    }),
    onFinish: async (result) => {
      // Save AI response
      await convex.mutation(api.chats.addMessage, {
        content: result.text,
        role: "assistant",
        chatId: chatId,
        userId: user!.id,
      });

      // Handle image upload after streaming is complete
      if (data?.imageUrl && userMessageId) {
        try {
          // Generate upload URL
          const uploadUrl = await convex.mutation(api.chats.generateUploadUrl);

          // Convert base64 to blob
          const base64Response = await fetch(data.imageUrl);
          const blob = await base64Response.blob();

          // Upload to Convex storage
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });

          const { storageId } = await uploadResult.json();

          // Update the user message with the storage ID
          await convex.mutation(api.chats.updateMessageWithImage, {
            messageId: userMessageId,
            content: userMessage.content.replace(
              /\n\n\[Images attached:.*?\]$/,
              ""
            ),
            imageUrl: storageId,
          });
        } catch (error) {
          console.error("Error uploading image to Convex:", error);
        }
      }
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
