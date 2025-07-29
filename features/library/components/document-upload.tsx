"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { FileUpload, FileUploadRef } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { uploadDocument } from "../actions/upload-actions";
import { toast } from "sonner";
import { useEffect } from "react";

export function DocumentUpload() {
  const [state, formAction, isPending] = useActionState(uploadDocument, null);
  const fileUploadRef = useRef<FileUploadRef>(null);

  // Handle form submission result
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Document uploaded successfully!");
      fileUploadRef.current?.clearFiles();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Upload Document
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Upload PDF documents to add them to your knowledge base. Once
          processed, you can search and chat with your documents.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="rounded-lg p-6">
          <FileUpload
            ref={fileUploadRef}
            onChange={(files) => {
              // Update the hidden form input when files are selected
              const formInput = document.getElementById(
                "files"
              ) as HTMLInputElement;
              if (formInput && files.length > 0) {
                const dataTransfer = new DataTransfer();
                files.forEach((file) => dataTransfer.items.add(file));
                formInput.files = dataTransfer.files;
              }
            }}
            inputId="files"
            multiple={false}
          />
          <input
            type="file"
            id="files"
            name="files"
            accept=".pdf"
            className="hidden"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white border-0"
          disabled={isPending || (state?.success === false && !!state?.error)}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            "Upload Document"
          )}
        </Button>
      </form>

      {state?.files && state.files.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Upload Details
          </h3>
          {state.files.map((file, index) => (
            <div
              key={index}
              className="text-sm text-green-700 dark:text-green-300"
            >
              <p>
                <strong>Name:</strong> {file.name}
              </p>
              <p>
                <strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                MB
              </p>
              <p>
                <strong>Type:</strong> {file.type}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
