import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Chat sessions
  chats: defineTable({
    title: v.string(),
    createdAt: v.number(),
    userId: v.string(),
  }).index("by_userId", ["userId"]),

  // Messages within chats
  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // For image support (choose whether its cloudinary or convex itself. )
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),

  // Flashcard decks (one per chat)
  flashcardDecks: defineTable({
    chatId: v.id("chats"),
    userId: v.string(),
    flashcards: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        hint: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chatId", ["chatId"])
    .index("by_userId", ["userId"]),
});
