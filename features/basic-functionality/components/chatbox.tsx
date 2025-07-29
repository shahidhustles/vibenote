"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Paperclip, ChevronDown, Send, BookOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { retrieveImagesFromMorphik } from "@/features/library/actions/retrieval-actions";

// Component to display image from Convex storage
function ConvexImage({
  storageId,
  onClick,
}: {
  storageId: Id<"_storage">;
  onClick?: () => void;
}) {
  const imageUrl = useQuery(api.chats.getImageUrl, { storageId });

  if (!imageUrl) {
    return <div className="w-32 h-32 bg-gray-200 rounded animate-pulse" />;
  }

  return (
    <Image
      src={imageUrl}
      alt="Uploaded image"
      width={200}
      height={200}
      className="max-w-xs max-h-48 object-cover rounded-lg mt-2 cursor-pointer"
      onClick={onClick}
    />
  );
}

type ChatBoxType = {
  chatId: Id<"chats">;
};

// Extended message type to include imageUrl
type ExtendedMessage = {
  id: string;
  role: string;
  content: string;
  imageUrl?: string | Id<"_storage">;
  morphikImages?: string[]; // Add this for Morphik images
  data?: {
    imageUrl?: string; // Base64 image data for immediate display
  };
};

export default function Chatbox({ chatId }: ChatBoxType) {
  const persistedMessages = useQuery(api.chats.getChatMessages, { chatId });
  const isLoadingMessages = persistedMessages === undefined;

  // Transform Convex messages to useChat format with image URLs
  const initialMessages =
    persistedMessages?.map((msg) => ({
      id: msg._id,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      imageUrl: msg.imageUrl, // Keep the storage ID or URL for display
      morphikImages: msg.morphikImages, // Include Morphik images
    })) || [];

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
  } = useChat({
    headers: {
      id: chatId,
    },
    initialMessages,
  });
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useLibrary, setUseLibrary] = useState(false);
  const [isProcessingMorphik, setIsProcessingMorphik] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [pendingMorphikImages, setPendingMorphikImages] = useState<string[]>(
    []
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear pending Morphik images only when a new conversation starts
  useEffect(() => {
    if (!isLoading && pendingMorphikImages.length > 0) {
      // Only clear if we're not processing Morphik and the last message is from assistant
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        // Don't auto-clear, let them persist until next use library action
      }
    }
  }, [isLoading, messages, pendingMorphikImages.length]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitWithImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Store the current input value before it gets reset
    const currentInput = input;

    if (useLibrary) {
      setIsProcessingMorphik(true);
      // Clear any previous pending images and input field
      setPendingMorphikImages([]);
      handleInputChange({ target: { value: "" } } as any);

      try {
        const retrievalResult = await retrieveImagesFromMorphik(currentInput);

        // Filter and validate image URLs before creating attachments
        const validImages = retrievalResult.success
          ? retrievalResult.images.filter((url) => {
              // Basic validation - ensure it's a string and looks like a URL or base64 data
              const isValid =
                typeof url === "string" &&
                (url.startsWith("http") || url.startsWith("data:image"));
              return isValid;
            })
          : [];

        const attachments = validImages.map((imageUrl: string) => {
          const contentType = imageUrl.endsWith(".png")
            ? "image/png"
            : imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")
              ? "image/jpeg"
              : imageUrl.startsWith("data:image/")
                ? imageUrl.split(";")[0].replace("data:", "")
                : "image/png";

          return {
            contentType,
            url: imageUrl,
          };
        });

        setIsProcessingMorphik(false);

        try {
          // Create a message with the attachments directly embedded for more reliable passing
          const message = {
            content: currentInput,
            role: "user" as const,
            // Add attachments directly to the message object
            experimental_attachments: attachments,
          };

          // Create options with attachments as well to maximize chances it gets through
          const options = {
            experimental_attachments: attachments,
          };

          // Store the images to be shown after AI response
          setPendingMorphikImages(validImages);

          // Try sending both ways to ensure it gets through
          await append(message, options);
        } catch (appendError) {
          alert("Error sending message to AI.");
        }
      } catch (error) {
        setIsProcessingMorphik(false);
        alert("Error processing images from library.");
        await append({ content: currentInput, role: "user" });
      }
    } else if (selectedImage) {
      handleSubmit(e, {
        data: { imageUrl: selectedImage },
      });
      removeImage();
    } else {
      // For normal messages, still use the original handleSubmit (which will clear the input)
      handleSubmit(e);
    }
  };

  const models = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5", label: "GPT-3.5" },
    { value: "claude", label: "Claude" },
    { value: "gemini", label: "Gemini 2.5 Flash" },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              setSelectedImage(base64);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  };

  // Always show hero section layout with messages above if they exist
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      {/* Hero Content and Messages */}
      <div className="flex-1 flex flex-col px-4 py-6 overflow-auto">
        {/* Loading state for persisted messages */}
        {isLoadingMessages && (
          <div className="w-full max-w-4xl mx-auto space-y-4 pt-6">
            {/* Skeleton messages */}
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[80%] p-2 rounded-xl">
                  <Skeleton className="h-6 w-[600px] mb-1" />
                  <Skeleton className="h-6 w-[400px] mb-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show hero content only when no messages and not loading */}
        {!isLoadingMessages && messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ minHeight: "25vh" }}
          >
            {/* Icon */}
            <div className="mb-6">
              <BookOpen className="w-12 h-12 text-black" />
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              New Learning Tab
            </h1>

            {/* Description */}
            <p className="text-gray-600 max-w-lg leading-relaxed mb-8 text-center">
              Start an interactive learning session by asking questions,
              exploring topics, or getting explanations on any subject. Your AI
              tutor is ready to help you learn at your own pace.
            </p>
          </div>
        )}

        {/* Messages when they exist */}
        {!isLoadingMessages && messages.length > 0 && (
          <div className="w-full max-w-4xl mx-auto space-y-4 pt-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md ml-auto"
                      : "bg-white border border-gray-200 shadow-sm text-gray-900 rounded-t-2xl rounded-br-2xl rounded-bl-md"
                  }`}
                >
                  {message.role === "user" ? (
                    <div>
                      <p className="text-md leading-relaxed">
                        {message.content}
                      </p>
                      {/* Display image from immediate data (base64) */}
                      {(message as ExtendedMessage).data?.imageUrl && (
                        <Image
                          src={(message as ExtendedMessage).data!.imageUrl!}
                          alt="Uploaded image"
                          width={200}
                          height={200}
                          className="max-w-xs max-h-48 object-cover rounded-lg mt-2 cursor-pointer"
                          onClick={() =>
                            setFullScreenImage(
                              (message as ExtendedMessage).data!.imageUrl!
                            )
                          }
                        />
                      )}
                      {/* Display image from Convex storage if it exists and no immediate data */}
                      {!(message as ExtendedMessage).data?.imageUrl &&
                        (message as ExtendedMessage).imageUrl &&
                        typeof (message as ExtendedMessage).imageUrl ===
                          "string" &&
                        (message as ExtendedMessage).imageUrl!.startsWith(
                          "k"
                        ) && (
                          <ConvexImage
                            storageId={
                              (message as ExtendedMessage)
                                .imageUrl as Id<"_storage">
                            }
                            onClick={() => {
                              // Need to get the actual URL for full screen
                              const imageUrl = (message as ExtendedMessage)
                                .imageUrl as string;
                              // This will need to be handled differently - for now just show a placeholder
                              setFullScreenImage(imageUrl);
                            }}
                          />
                        )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-md leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="ml-2">{children}</li>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-semibold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-semibold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mb-1">
                                {children}
                              </h3>
                            ),
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Display Morphik images for AI responses */}
                      {message.role === "assistant" &&
                        (message as ExtendedMessage).morphikImages &&
                        (message as ExtendedMessage).morphikImages!.length >
                          0 && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-xs text-purple-600 mb-3 font-medium">
                              📚 Related images from your library:
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                              {(message as ExtendedMessage).morphikImages!.map(
                                (imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="group cursor-pointer"
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`Library image ${index + 1}`}
                                      width={150}
                                      height={150}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-purple-300 transition-colors duration-200 shadow-sm hover:shadow-md"
                                      onClick={() =>
                                        setFullScreenImage(imageUrl)
                                      }
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* Display pending Morphik images for the latest AI response */}
                      {message.role === "assistant" &&
                        messages.indexOf(message) === messages.length - 1 &&
                        !isLoading &&
                        pendingMorphikImages.length > 0 && (
                          <div className="mt-4 border-t border-gray-100 pt-4">
                            <p className="text-xs text-purple-600 mb-3 font-medium">
                              📚 Related images from your library:
                            </p>
                            <div className="grid grid-cols-2 gap-3 max-w-md">
                              {pendingMorphikImages.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="group cursor-pointer"
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Library image ${index + 1}`}
                                    width={150}
                                    height={150}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:border-purple-300 transition-colors duration-200 shadow-sm hover:shadow-md"
                                    onClick={() => setFullScreenImage(imageUrl)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading message when AI is responding */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
                      <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6 text-purple-600"
                        >
                          <path d="M12 3a9 9 0 0 0-9 9h9v9a9 9 0 0 0 9-9a9 9 0 0 0-9-9z"></path>
                          <path d="M3 12a9 9 0 0 1 9-9v9H3z"></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm text-gray-700">
                        VibeNote AI
                      </span>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input Section - Always shown */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Use Library Toggle */}
          <div className="flex items-center mb-4">
            <label
              htmlFor="useLibraryToggle"
              className="mr-3 text-sm font-medium text-gray-700 select-none"
            >
              Use Library
            </label>
            <div className="relative inline-block w-8 align-middle select-none">
              <input
                id="useLibraryToggle"
                type="checkbox"
                checked={useLibrary}
                onChange={() => setUseLibrary((prev) => !prev)}
                className="opacity-0 absolute block w-4 h-4 rounded-full bg-white appearance-none cursor-pointer"
              />
              <label
                htmlFor="useLibraryToggle"
                className={`block overflow-hidden h-4 rounded-full cursor-pointer transition-colors duration-200 ${
                  useLibrary
                    ? "bg-gradient-to-r from-blue-400 to-purple-500"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                    useLibrary ? "translate-x-4" : "translate-x-0"
                  }`}
                ></span>
              </label>
            </div>
          </div>
          {/* Morphik Processing State */}
          {isProcessingMorphik && (
            <div className="mb-4 p-2 border border-blue-200 rounded-lg bg-blue-50 text-blue-700 text-center">
              Getting the right pages from the library ...
            </div>
          )}
          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-4 p-2 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={selectedImage}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {imageFile?.name || "Image attached"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmitWithImage}
            className="space-y-4"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="relative">
              <textarea
                name="prompt"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={isLoading}
                placeholder={
                  isLoading
                    ? "AI is responding..."
                    : messages.length === 0
                      ? "Ask me anything to start learning... (Ctrl+V to paste images)"
                      : "Continue the conversation... (Ctrl+V to paste images)"
                }
                className="w-full h-32 p-4 pr-16 pt-12 rounded-xl border border-gray-200 bg-white shadow-lg resize-none text-base placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Model Dropdown */}
              <div className="absolute top-3 left-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-md"
                    >
                      {selectedModel}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    {models.map((model) => (
                      <DropdownMenuItem
                        key={model.value}
                        onClick={() => setSelectedModel(model.label)}
                        className="text-sm"
                      >
                        {model.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Attachment Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-12 w-8 h-8 hover:bg-gray-100"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
              </Button>

              {/* Send Button */}
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute bottom-3 right-3 w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Full-screen image modal */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setFullScreenImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <Image
              src={fullScreenImage}
              alt="Full screen view"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
