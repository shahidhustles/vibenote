import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new video entry
export const createVideo = mutation({
  args: {
    userId: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("videos", {
      userId: args.userId,
      topic: args.topic,
      videoUrl: "", // Will be updated when video is generated
      generationStatus: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return videoId;
  },
});

// Update video with URL and status
export const updateVideoStatus = mutation({
  args: {
    videoId: v.id("videos"),
    videoUrl: v.optional(v.string()),
    generationStatus: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: {
      generationStatus: "pending" | "generating" | "completed" | "failed";
      updatedAt: number;
      videoUrl?: string;
      error?: string;
    } = {
      generationStatus: args.generationStatus,
      updatedAt: Date.now(),
    };

    if (args.videoUrl) {
      updateData.videoUrl = args.videoUrl;
    }

    if (args.error) {
      updateData.error = args.error;
    }

    await ctx.db.patch(args.videoId, updateData);
    return args.videoId;
  },
});

// Get videos by user
export const getVideosByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    return videos;
  },
});

// Get a specific video by ID
export const getVideoById = query({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.videoId);
    return video;
  },
});

// Delete a video
export const deleteVideo = mutation({
  args: {
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.videoId);
    return args.videoId;
  },
});
