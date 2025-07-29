"use server";

import { api } from "@/convex/_generated/api";
import { convex } from "@/lib/convex";
import { getPythonApiUrl } from "@/lib/api-config";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type UploadResult = {
  success: boolean;
  documentId?: string;
  files?: {
    name: string;
    type: string;
    size: number;
    lastModified: string;
  }[];
  message?: string;
  error?: string;
};

export async function uploadDocument(
  _prevState: UploadResult | null,
  formData: FormData
): Promise<UploadResult> {
  try {
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      return { success: false, error: "No files provided" };
    }

    // Ensure we're only processing one file
    if (files.length > 1) {
      return { success: false, error: "Please upload only one file at a time" };
    }

    const file = files[0];
    if (!(file instanceof File)) {
      return { success: false, error: "Invalid file format" };
    }

    // Validate file type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return { success: false, error: "Only PDF files are supported" };
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "User not logged in",
      };
    }

    // Generate upload URL and upload file to Convex storage
    const postUrl = await convex.mutation(api.documents.generateUploadUrl);

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error(`Upload failed with status: ${result.status}`);
    }

    const { storageId } = await result.json();

    // Create document record in database
    const documentId = await convex.mutation(api.documents.createDocument, {
      userId,
      filename: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storageId,
    });

    // Get the file URL for Morphik ingestion
    const document = await convex.query(api.documents.getDocument, {
      documentId,
    });

    if (!document?.fileUrl) {
      throw new Error("Failed to get document URL");
    }

    // Update status to processing
    await convex.mutation(api.documents.updateIngestStatus, {
      documentId,
      status: "processing",
    });

    // Send to Morphik AI for ingestion
    try {
      const ingestResult = await fetch(getPythonApiUrl("ingest"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          file_url: document.fileUrl,
        }),
      });

      if (!ingestResult.ok) {
        await convex.mutation(api.documents.updateIngestStatus, {
          documentId,
          status: "failed",
          error: `Ingest failed with status: ${ingestResult.status}`,
        });
        throw new Error(`Ingest failed with status: ${ingestResult.status}`);
      }

      // Update status to completed
      await convex.mutation(api.documents.updateIngestStatus, {
        documentId,
        status: "completed",
      });

      console.log("File successfully sent to Morphik AI for processing");
    } catch (ingestError) {
      console.error("Error sending file to Morphik AI:", ingestError);
      await convex.mutation(api.documents.updateIngestStatus, {
        documentId,
        status: "failed",
        error:
          ingestError instanceof Error
            ? ingestError.message
            : "Unknown ingestion error",
      });

      // Don't fail the upload if ingestion fails - user can retry later
      return {
        success: true,
        documentId,
        message: `File uploaded successfully but ingestion failed: ${ingestError instanceof Error ? ingestError.message : "Unknown error"}`,
        files: [
          {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: new Date(file.lastModified).toISOString(),
          },
        ],
      };
    }

    revalidatePath("/library");

    return {
      success: true,
      documentId,
      message: `Successfully uploaded and processed: ${file.name}`,
      files: [
        {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
        },
      ],
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error occurred during upload",
    };
  }
}

export async function deleteDocument(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "User not logged in" };
    }

    await convex.mutation(api.documents.deleteDocument, {
      documentId: documentId as any,
      userId,
    });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}
