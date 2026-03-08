import { Button } from "@/components/ui/button";
import { FolderPlus, Layers } from "lucide-react";

export function CollectionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-orange-50">
        <div className="absolute h-24 w-24 rounded-full bg-orange-100/50" />
        <div className="relative z-10 text-orange-400">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            <path d="m9.5 13.5 5-5"></path>
            <path d="m14.5 13.5-5-5"></path>
          </svg>
        </div>
      </div>
      <h2 className="mb-3 text-[22px] font-bold text-gray-900">
        No collections yet
      </h2>
      <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-gray-500">
        Create your first collection to organize reusable quiz content, manage
        questions, and build templates faster.
      </p>
      <div className="flex items-center gap-4">
        <Button className="h-12 gap-2 rounded-full bg-orange-600 px-6 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md">
          <FolderPlus className="h-5 w-5" />
          Create Collection
        </Button>
        <Button
          variant="outline"
          className="h-12 gap-2 rounded-full border-gray-200 px-6 text-[15px] font-bold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Layers className="h-5 w-5 text-gray-500" />
          Explore Templates
        </Button>
      </div>

      <div className="mt-16 grid max-w-3xl grid-cols-1 gap-8 text-center md:grid-cols-3">
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h4 className="mb-1 text-sm font-semibold text-gray-900">
            Centralized Library
          </h4>
          <p className="text-xs text-gray-500">
            Keep all your questions in one organized place.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
            </svg>
          </div>
          <h4 className="mb-1 text-sm font-semibold text-gray-900">
            Collaborative Sharing
          </h4>
          <p className="text-xs text-gray-500">
            Invite teammates to contribute to collections.
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m13 2-2 2.5h3L11 8" />
              <path d="M12 2v20" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <h4 className="mb-1 text-sm font-semibold text-gray-900">
            Smart Reuse
          </h4>
          <p className="text-xs text-gray-500">
            Import collections into any new quiz instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
