"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { deleteDocument } from "../actions/upload-actions";
import { toast } from "sonner";
import { useState } from "react";

export function DocumentList() {
  const { user } = useUser();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const documents = useQuery(
    api.documents.getUserDocuments,
    user?.id ? { userId: user.id } : "skip"
  );

  const handleDelete = async (documentId: string) => {
    setDeletingIds((prev) => new Set(prev).add(documentId));
    try {
      const result = await deleteDocument(documentId);
      if (result.success) {
        toast.success("Document deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Ready";
      case "processing":
        return "Processing...";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Please sign in to view your documents
      </div>
    );
  }

  if (!documents) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
        <FileText className="h-16 w-16 text-gray-300" />
        <div className="text-center">
          <h3 className="text-lg font-medium">No documents yet</h3>
          <p className="text-sm">Upload your first document to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Your Documents
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {documents.length} documents
        </span>
      </div>

      <div className="space-y-3">
        {documents.map((document) => (
          <div
            key={document._id}
            className="relative group rounded-lg p-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FileText className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {document.originalName}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>
                      {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusIcon(document.ingestStatus)}
                    <span
                      className={`text-sm ${
                        document.ingestStatus === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : document.ingestStatus === "failed"
                            ? "text-red-600 dark:text-red-400"
                            : document.ingestStatus === "processing"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {getStatusText(document.ingestStatus)}
                    </span>
                    {document.ingestError && (
                      <span className="text-xs text-red-500 truncate">
                        - {document.ingestError}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document._id)}
                disabled={deletingIds.has(document._id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {deletingIds.has(document._id) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
