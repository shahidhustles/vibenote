import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { currentUser } from "@clerk/nextjs/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Type definitions
interface Attachment {
  url: string;
  [key: string]: unknown;
}

interface ContentItem {
  type: string;
  text?: string;
  image?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string | ContentItem[];
  experimental_attachments?: Attachment[];
}

interface RequestBody {
  messages: Message[];
  data?: { imageUrl?: string };
  experimental_attachments?: Attachment[];
  options?: { experimental_attachments?: Attachment[] };
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  // Parse request body and extract all properties
  let requestBody: RequestBody;
  try {
    const rawText = await req.text();
    requestBody = JSON.parse(rawText) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Destructure with optional chaining to avoid errors
  const { messages, data } = requestBody;

  // Get experimental_attachments from all possible locations
  let experimental_attachments: Attachment[] = [];

  // Check all possible locations where attachments might be
  if (requestBody.experimental_attachments) {
    experimental_attachments = Array.isArray(
      requestBody.experimental_attachments
    )
      ? requestBody.experimental_attachments
      : [];
  } else if (requestBody.options?.experimental_attachments) {
    experimental_attachments = requestBody.options.experimental_attachments;
  } else if (requestBody.messages && requestBody.messages.length > 0) {
    // Check if the last message has experimental_attachments
    const lastMessage = requestBody.messages[requestBody.messages.length - 1];
    if (lastMessage.experimental_attachments) {
      experimental_attachments = lastMessage.experimental_attachments;
    }
  }

  // Add attachments to request body for later access
  requestBody.experimental_attachments = experimental_attachments;

  const headers = req.headers;
  const chatId = headers.get("id") as Id<"chats">;
  const user = await currentUser();

  if (!chatId || !user) {
    return new Response(
      JSON.stringify({ error: "User authentication or chat ID missing" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
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
    let cleanContent: string;
    if (typeof userMessage.content === 'string') {
      cleanContent = userMessage.content.replace(
        /\n\n\[Images attached:.*?\]$/,
        ""
      );
    } else {
      // Extract text from content array
      cleanContent = userMessage.content
        .filter((item) => item.type === "text")
        .map((item) => item.text || "")
        .join(" ");
    }

    // Save the text content to Convex first (without Morphik images)
    userMessageId = await convex.mutation(api.chats.addMessage, {
      content: cleanContent,
      role: userMessage.role,
      chatId: chatId,
      userId: user!.id,
    });
  }

  // Wrap the streaming process in a try-catch to better handle errors
  try {
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
                image: data.imageUrl, // Base64 data URL
              },
            ],
          };
        }
        // Handle experimental attachments (from Morphik library)
        else if (msg === userMessage && experimental_attachments?.length > 0) {
          // Create content array with text and images
          const content: ContentItem[] = [
            {
              type: "text",
              text: msg.content as string,
            },
          ];

          // Add each attachment as an image
          experimental_attachments.forEach((att: Attachment) => {
            if (att.url) {
              try {
                // Add image to content array
                content.push({
                  type: "image",
                  image: att.url,
                });
              } catch {
                // Fallback to text representation if image fails
                content.push({
                  type: "text",
                  text: `[Image: ${att.url.substring(0, 30)}...]`,
                });
              }
            }
          });

          return {
            role: msg.role,
            content: content,
          };
        }
        return msg;
      }),
      onFinish: async (result) => {
        // Extract Morphik images from the user message if they exist
        const morphikImages =
          experimental_attachments.length > 0
            ? experimental_attachments
                .map((att: Attachment) => att.url)
                .filter(Boolean)
            : [];

        // Save AI response with Morphik images
        await convex.mutation(api.chats.addMessage, {
          content: result.text,
          role: "assistant",
          chatId: chatId,
          userId: user!.id,
          morphikImages: morphikImages.length > 0 ? morphikImages : undefined,
        });

        // Handle image upload after streaming is complete
        if (data?.imageUrl && userMessageId) {
          try {
            // Generate upload URL
            const uploadUrl = await convex.mutation(
              api.chats.generateUploadUrl
            );

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
              content: typeof userMessage.content === 'string' 
                ? userMessage.content.replace(/\n\n\[Images attached:.*?\]$/, "")
                : userMessage.content
                    .filter((item) => item.type === "text")
                    .map((item) => item.text || "")
                    .join(" "),
              imageUrl: storageId,
            });
          } catch (error) {
            console.error("Error uploading image to Convex:", error);
          }
        }
      },
    });

    if (isFirstMessage) {
      try {
        // Extract just the text content for title generation
        let userTextContent = "";

        if (typeof userMessage.content === "string") {
          userTextContent = userMessage.content;
        } else if (Array.isArray(userMessage.content)) {
          // Extract text from content array
          userTextContent = userMessage.content
            .filter((item) => item.type === "text" && item.text)
            .map((item) => item.text!)
            .join(" ");
        }

        try {
          const { text: title } = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: `Generate a short, concise title (maximum 5 words) for this conversation based on 
        the user's message. Only return the title, nothing else. User message: "${userTextContent}"`,
            temperature: 0.3,
          });

          // Update with generated title or fallback
          await convex.mutation(api.chats.updateChatTitle, {
            chatId,
            title: title || "New Conversation",
          });
        } catch {
          // Fallback title if generation fails
          await convex.mutation(api.chats.updateChatTitle, {
            chatId,
            title: "New Learning Session",
          });
        }
      } catch {
        // Continue even if title generation fails
      }
    }

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "An error occurred processing your request",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
