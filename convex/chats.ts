import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =====================
// CHAT CRUD OPERATIONS
// =====================

// Create a new chat
export const createChat = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      createdAt: Date.now(),
    });
    return chatId;
  },
});

// Get all chats for a user
export const getUserChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return chats;
  },
});

// Get a specific chat by ID
export const getChat = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    return chat;
  },
});

// Update chat title
export const updateChatTitle = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.chatId, {
      title: args.title,
    });
  },
});

// Delete a chat and all its messages
export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    // First delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Then delete the chat
    await ctx.db.delete(args.chatId);
  },
});

// =========================
// MESSAGE CRUD OPERATIONS
// =========================

// Add a message to a chat
export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

// Get all messages for a chat
export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
    return messages;
  },
});

// Update a message (useful for editing)
export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
  },
});

// ========================
// UTILITY FUNCTIONS
// ========================

// Get chat with its latest message (for chat list preview)
// when user clicks on any sidebar chats
export const getUserChatsWithPreview = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const chatsWithPreview = await Promise.all(
      chats.map(async (chat) => {
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        return {
          ...chat,
          lastMessage: lastMessage?.content || "No messages yet",
          lastMessageTime: lastMessage?.createdAt || chat.createdAt,
          messageCount: await ctx.db
            .query("messages")
            .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
            .collect()
            .then((messages) => messages.length),
        };
      })
    );

    return chatsWithPreview;
  },
});

// Search chats by title
export const searchChats = query({
  args: {
    userId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allChats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter in JavaScript since Convex doesn't support string methods in filters
    const filteredChats = allChats.filter((chat) =>
      chat.title.toLowerCase().includes(args.searchTerm.toLowerCase())
    );

    return filteredChats;
  },
});

// Get message count for a chat
export const getChatMessageCount = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
    return messages.length;
  },
});

// Create chat with first message (common pattern)
export const createChatWithMessage = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the chat
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      createdAt: Date.now(),
    });

    // Add the first user message
    const messageId = await ctx.db.insert("messages", {
      chatId: chatId,
      userId: args.userId,
      role: "user",
      content: args.content,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });

    return { chatId, messageId };
  },
});

// Get user's recent chats (limit to 10)
//for sidebar
export const getRecentChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
    return chats;
  },
});


// Bulk delete messages (useful for clearing chat history)
export const clearChatHistory = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deletedCount: messages.length };
  },
});
