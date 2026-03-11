"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import QuestionSidebar from "./QuestionSidebar";
import QuestionSettings from "./QuestionSettings";
import { useQuizEditorStore } from "@/store/quiz-editor/useQuizEditorStore";

interface EditorLayoutProps {
  children: React.ReactNode;
  onSave?: () => void;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ children, onSave }) => {
  const { title, description, updateQuizInfo, isSaving, errors } =
    useQuizEditorStore();
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/quizes")}
            className="group flex items-center gap-3 rounded-xl p-1.5 pr-4 transition-all hover:bg-gray-100"
          >
            <div className="rounded-lg bg-orange-600 p-2 transition-transform group-hover:scale-105">
              <Image
                src="/images/logo/logo.svg"
                alt="Logo"
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            </div>
          </button>

          <div className="mx-1 h-8 w-px bg-gray-100" />

          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => updateQuizInfo({ title: e.target.value })}
              className={`w-full max-w-[300px] border-0 bg-transparent p-0 leading-tight font-bold text-gray-900 placeholder:text-gray-300 focus:ring-0 ${
                errors.title ? "text-red-500 placeholder:text-red-300" : ""
              }`}
              placeholder="Quiz Title"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => updateQuizInfo({ description: e.target.value })}
              className={`mt-0.5 block w-full max-w-[400px] border-0 bg-transparent p-0 text-[10px] font-medium text-gray-400 placeholder:text-gray-200 focus:ring-0 ${
                errors.description
                  ? "text-red-400 placeholder:text-red-200"
                  : ""
              }`}
              placeholder="Add a description for this quiz..."
            />
            {errors.title || errors.description ? (
              <p className="mt-1 text-[9px] font-bold tracking-wider text-red-500 uppercase">
                {errors.title || errors.description}
              </p>
            ) : (
              <p className="mt-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Drafts saved automatically
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Preview
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              "Save Quiz"
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <QuestionSidebar />

        {/* Main Content */}
        <main className="relative flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="mx-auto max-w-3xl space-y-6">{children}</div>
        </main>

        {/* Right Settings */}
        <QuestionSettings />
      </div>
    </div>
  );
};

export default EditorLayout;
