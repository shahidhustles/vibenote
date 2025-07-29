"use server";

import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { currentUser } from "@clerk/nextjs/server";

interface GenerateVideoState {
  videoUrl?: string;
  error?: string;
  isLoading?: boolean;
  videoId?: string;
}

export const generateVideoForPage = async (
  prevState: GenerateVideoState,
  formData: FormData
): Promise<GenerateVideoState> => {
  try {
    const topic = formData.get("topic") as string;

    if (!topic) {
      return { error: "Topic is required" };
    }

    const user = await currentUser();

    // Create a default chat for videos if needed, or use a special video chat ID
    // For now, we'll create video entries without requiring a specific chat
    const videoId = await fetchMutation(api.videos.createVideo, {
      userId: user!.id,
      topic,
    });

    // Update status to generating
    await fetchMutation(api.videos.updateVideoStatus, {
      videoId,
      generationStatus: "generating",
    });

    // Call your video generation API
    const response = await fetch("http://127.0.0.1:5001/generate-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate video");
    }

    const data = await response.json();
    console.log(data);
    const videoUrl = data.video_url;

    if (!videoUrl) {
      throw new Error("No video URL received from API");
    }

    // Update video with URL and completed status
    await fetchMutation(api.videos.updateVideoStatus, {
      videoId,
      videoUrl,
      generationStatus: "completed",
    });

    return {
      videoUrl,
      videoId: videoId.toString(),
      isLoading: false,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      error: errorMessage,
      isLoading: false,
    };
  }
};
