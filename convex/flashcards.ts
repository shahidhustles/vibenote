import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// =====================
// FLASHCARD OPERATIONS
// =====================

// Create or update flashcard deck for a chat
export const createOrUpdateFlashcardDeck = mutation({
  args: {
    chatId: v.id("chats"),
    userId: v.string(),
    flashcards: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
        hint: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if a flashcard deck already exists for this chat
    const existingDeck = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (existingDeck) {
      // Update existing deck
      await ctx.db.patch(existingDeck._id, {
        flashcards: args.flashcards,
        updatedAt: Date.now(),
      });
      return existingDeck._id;
    } else {
      // Create new deck
      const deckId = await ctx.db.insert("flashcardDecks", {
        chatId: args.chatId,
        userId: args.userId,
        flashcards: args.flashcards,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return deckId;
    }
  },
});

// Get flashcard deck for a chat
export const getFlashcardDeck = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const deck = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
    return deck;
  },
});

// Get all flashcard decks for a user
export const getUserFlashcardDecks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const decks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return decks;
  },
});

// Delete flashcard deck
export const deleteFlashcardDeck = mutation({
  args: {
    deckId: v.id("flashcardDecks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.deckId);
  },
});
