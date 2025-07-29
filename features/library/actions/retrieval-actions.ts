"use server";

export interface retrievalImages {
  error?: string;
  success: boolean;
  images: string[];
  metadata?: {
    documentIds?: string[];
    downloadUrls?: string[];
    filenames?: string[];
  };
}

// Define a type for the image content items
interface ImageContentItem {
  image_url?: string;
  content?: string;
  document_id?: string;
  download_url?: string;
  filename?: string;
}

import { currentUser } from "@clerk/nextjs/server";
import { getPythonApiUrl } from "@/lib/api-config";

export const retrieveImagesFromMorphik = async (
  req: string
): Promise<retrievalImages> => {
  const user = await currentUser();

  if (!user) {
    return { images: [], success: false, error: "user not authorized" };
  }

  try {
    const apiUrl = getPythonApiUrl("retrieval");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        query: req,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();

    const imageUrls: string[] = [];
    const documentIds: string[] = [];
    const downloadUrls: string[] = [];
    const filenames: string[] = [];

    if (data.image_content && Array.isArray(data.image_content)) {
      data.image_content.forEach((item: ImageContentItem) => {
        if (item.image_url) {
          imageUrls.push(item.image_url);
        } else if (item.content && typeof item.content === "string") {
          imageUrls.push(item.content);
        }

        if (item.document_id) documentIds.push(item.document_id);
        if (item.download_url) downloadUrls.push(item.download_url);
        if (item.filename) filenames.push(item.filename);
      });
    }

    return {
      images: imageUrls,
      metadata: {
        documentIds,
        downloadUrls,
        filenames,
      },
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      images: [],
      error: `Error retrieving images: ${errorMessage}`,
      success: false,
    };
  }
};
