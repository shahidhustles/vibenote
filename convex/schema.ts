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
    // For image support - can be either a URL string or storage ID
    imageUrl: v.optional(v.union(v.string(), v.id("_storage"))),
    // For Morphik library images
    morphikImages: v.optional(v.array(v.string())),
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

  // Documents uploaded by users
  documents: defineTable({
    userId: v.string(),
    filename: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
    fileUrl: v.string(),
    uploadedAt: v.number(),
    ingestStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    ingestError: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_ingestStatus", ["ingestStatus"]),

  // AI Tutor Videos
  videos: defineTable({
    userId: v.string(),
    topic: v.string(),
    videoUrl: v.string(),
    generationStatus: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["generationStatus"]),
});
