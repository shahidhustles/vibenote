import { DocumentList } from "@/features/library/components/document-list";
import { DocumentUpload } from "@/features/library/components/document-upload";
import { Separator } from "@/components/ui/separator";

export default function LibraryPage() {
  return (
    <div className="container mx-auto p-6 h-screen">
      <div className="flex flex-col lg:flex-row gap-8 h-full">
        {/* Left Side - Upload Form */}
        <div className="flex-1">
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-cyan-900/10 rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/20 h-full">
            <DocumentUpload />
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="hidden lg:flex justify-center items-center">
          <Separator
            orientation="vertical"
            className="h-full bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500 w-px opacity-30"
          />
        </div>

        {/* Right Side - Document List */}
        <div className="flex-1">
          <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-neutral-50 dark:from-gray-900/50 dark:via-slate-900/50 dark:to-neutral-900/50 rounded-lg p-6 border border-gray-200 dark:border-gray-800 h-full">
            <DocumentList />
          </div>
        </div>
      </div>
    </div>
  );
}
