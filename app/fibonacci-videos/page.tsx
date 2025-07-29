"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Copy, Video, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { generateVideoForPage } from "./actions/generate-video-page";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const FibonacciPage = () => {
  const [state, formAction, isLoading] = useActionState(
    generateVideoForPage,
    {}
  );

  const { user, isLoaded } = useUser();

  // Get all videos for display - only query if user is loaded and exists
  const allVideos = useQuery(
    api.videos.getVideosByUserId,
    isLoaded && user ? { userId: user.id } : "skip"
  );

  //   // Show loading skeleton while user is loading or user doesn't exist
  //   if (!isLoaded || !user) {
  //     return (
  //       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
  //         <div className="max-w-7xl mx-auto">
  //           {/* Header Skeleton */}
  //           <div className="mb-12 text-center">
  //             <div className="h-12 bg-blue-200/60 rounded-xl mb-4 animate-pulse"></div>
  //             <div className="h-6 bg-blue-200/60 rounded-lg mx-auto max-w-md animate-pulse"></div>
  //           </div>

  //           {/* Input Section Skeleton */}
  //           <div className="mb-12">
  //             <div className="bg-white/80 rounded-2xl border border-blue-200/50 p-8 shadow-xl backdrop-blur-sm">
  //               <div className="space-y-4">
  //                 <div className="h-6 bg-blue-200/60 rounded-lg w-1/3 animate-pulse"></div>
  //                 <div className="flex gap-4">
  //                   <div className="flex-1 h-12 bg-blue-200/60 rounded-xl animate-pulse"></div>
  //                   <div className="w-32 h-12 bg-blue-200/60 rounded-xl animate-pulse"></div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* Videos Grid Skeleton */}
  //           <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
  //             {Array.from({ length: 8 }, (_, i) => (
  //               <div key={i} className="break-inside-avoid">
  //                 <div
  //                   className="bg-white/80 rounded-2xl border border-blue-200/50 overflow-hidden shadow-xl backdrop-blur-sm p-4 animate-pulse"
  //                   style={{ height: `${200 + (i % 3) * 80}px` }}
  //                 >
  //                   <div className="h-full bg-blue-200/60 rounded-xl"></div>
  //                 </div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  // Show loading skeleton while videos are loading
  if (allVideos === undefined) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 animate-pulse">
                  <div className="h-5 w-5 bg-white/70 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {/* Videos Grid Skeleton */}
              <div className="flex-1 overflow-y-auto bg-white/40 dark:bg-gray-900/40">
                <div className="p-6">
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <div
                        key={index}
                        className="break-inside-avoid mb-4"
                        style={{
                          height: `${200 + (index % 3) * 80}px`,
                        }}
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full flex flex-col animate-pulse">
                          {/* Video Preview Skeleton */}
                          <div className="flex-1 bg-gradient-to-br from-gray-200 via-blue-100 to-purple-100 dark:from-gray-700 dark:via-blue-900/30 dark:to-purple-900/30 relative">
                            <div className="absolute inset-4">
                              <div className="w-full h-full bg-white/30 dark:bg-gray-800/30 rounded-lg flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/50 dark:bg-gray-600/50 rounded-full flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                </div>
                              </div>
                            </div>
                            {/* Status indicator skeleton */}
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                            </div>
                          </div>

                          {/* Video Info Skeleton */}
                          <div className="p-3 bg-white dark:bg-gray-800 space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Form Skeleton */}
              <div className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="px-6 py-4">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <div className="h-12 bg-blue-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <div className="h-5 w-5 bg-blue-200 dark:bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-12 w-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Video URL copied to clipboard!");
  };

  const handleOpenInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Tutor Videos
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize anything, find it here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex">
          {/* Video Generation & Display Area */}
          <div className="flex-1 flex flex-col">
            {/* Videos Grid */}
            <div className="flex-1 overflow-y-auto bg-white/40 dark:bg-gray-900/40">
              <div className="p-6">
                {/* Error Display */}
                {state.error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {state.error}
                    </p>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Generating your video...
                      </p>
                    </div>
                  </div>
                )}

                {/* Videos Masonry Grid */}
                {allVideos === undefined ? (
                  // Loading skeleton - 2 rows of equal squares
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                      >
                        <Skeleton className="h-full w-full" />
                      </div>
                    ))}
                  </div>
                ) : allVideos.length === 0 ? (
                  // Empty state
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 p-6 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-full">
                      <Video className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      No videos yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      Ask ChatGPT to turn any idea into an image, diagram, or
                      visual.
                    </p>
                  </div>
                ) : (
                  // Videos masonry grid
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {allVideos.map((video, index) => (
                      <div
                        key={video._id}
                        className="break-inside-avoid mb-4"
                        style={{
                          height: `${200 + (index % 3) * 80}px`, // Varying heights for masonry effect
                        }}
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 h-full flex flex-col">
                          {/* Video Player/Preview */}
                          {video.generationStatus === "completed" &&
                          video.videoUrl ? (
                            <div className="relative group flex-1">
                              <video
                                src={video.videoUrl}
                                controls
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg">
                                  ✓
                                </span>
                              </div>
                              {/* Overlay buttons on hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    handleOpenInNewTab(video.videoUrl!)
                                  }
                                  className="bg-white/90 hover:bg-white text-gray-800"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleCopyUrl(video.videoUrl!)}
                                  className="bg-white/90 hover:bg-white text-gray-800"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : video.generationStatus === "generating" ? (
                            <div className="flex-1 bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-8 h-8 mx-auto mb-2 relative">
                                  <div className="w-8 h-8 border-2 border-purple-200 dark:border-purple-700 rounded-full"></div>
                                  <div className="absolute top-0 left-0 w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                  Generating...
                                </p>
                              </div>
                            </div>
                          ) : video.generationStatus === "failed" ? (
                            <div className="flex-1 bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-200 dark:border-red-800 border-dashed">
                              <div className="text-center">
                                <div className="w-8 h-8 mx-auto mb-2 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                  <span className="text-red-600 dark:text-red-400 text-sm">
                                    ⚠
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                  Failed
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                  <Video className="w-4 h-4 text-gray-500" />
                                </div>
                                <p className="text-xs text-gray-500">Pending</p>
                              </div>
                            </div>
                          )}

                          {/* Video Info - Always at bottom */}
                          <div className="p-3 bg-white dark:bg-gray-800">
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-2 mb-1">
                              {video.topic}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </p>

                            {/* Error display for failed videos */}
                            {video.generationStatus === "failed" &&
                              video.error && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {video.error}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Generation Form - Now at bottom */}
            <div className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="px-6 py-4">
                <form action={formAction} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      name="topic"
                      placeholder="Ask ChatGPT to turn any idea into an image, diagram, or visual."
                      required
                      disabled={isLoading}
                      className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl shadow-sm"
                    />
                    <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-6 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? "Generating..." : "Generate Video"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FibonacciPage;
