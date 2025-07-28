import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import convex from "@/lib/convex";
import type { Metadata } from "next";
import NewChatPageClient from "../../../features/main/components/newchat-page";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const chat = await convex.query(api.chats.getChat, {
      chatId: id as Id<"chats">,
    });

    if (chat?.title) {
      return {
        title: `${chat.title} - VibeNote.ai`,
        description: `Continue your learning conversation: ${chat.title}`,
      };
    }
  } catch (error) {
    console.error("Error fetching chat for metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Chat - VibeNote.ai",
    description: "Continue your AI-powered learning session",
  };
}

const NewChatPage = async ({ params }: Props) => {
  const { id } = await params;
  const chatId = id as Id<"chats">;

  return <NewChatPageClient chatId={chatId} />;
};

export default NewChatPage;
