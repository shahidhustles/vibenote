import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store document metadata after upload
export const createDocument = mutation({
  args: {
    userId: v.string(),
    filename: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);

    if (!fileUrl) {
      throw new Error("Failed to get file URL");
    }

    const documentId = await ctx.db.insert("documents", {
      userId: args.userId,
      filename: args.filename,
      originalName: args.originalName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      storageId: args.storageId,
      fileUrl,
      uploadedAt: Date.now(),
      ingestStatus: "pending",
    });

    return documentId;
  },
});

// Update document ingest status
export const updateIngestStatus = mutation({
  args: {
    documentId: v.id("documents"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      ingestStatus: args.status,
      ingestError: args.error,
    });
  },
});

// Get all documents for a user
export const getUserDocuments = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return documents;
  },
});

// Get document by ID
export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Delete document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);

    if (!document || document.userId !== args.userId) {
      throw new Error("Document not found or unauthorized");
    }

    // Delete from storage
    await ctx.storage.delete(document.storageId);

    // Delete from database
    await ctx.db.delete(args.documentId);
  },
});
