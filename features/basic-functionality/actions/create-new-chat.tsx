"use server";

import convex from "../../../lib/convex";
import { api } from "@/convex/_generated/api";

type CreateNewChatType = {
  userId: string;
  title: string;
};

export const createNewChat = async ({
  userId,
  title,
}: CreateNewChatType): Promise<string> => {
  const chatId = await convex.mutation(api.chats.createChat, {
    title,
    userId,
  });

  return `/chat/${chatId}`;
};
