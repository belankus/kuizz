"use client";

import React, { useState } from "react";
import { X, FileText, Layout, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreationMethod = "SCRATCH" | "TEMPLATE" | "AI";

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] =
    useState<CreationMethod>("SCRATCH");

  if (!isOpen) return null;

  const methods = [
    {
      id: "SCRATCH" as CreationMethod,
      title: "Start from scratch",
      description:
        "Build your quiz manually with full control over every single detail.",
      icon: (
        <FileText
          size={48}
          className="text-gray-400 transition-colors group-hover:text-blue-600"
        />
      ),
      badge: null,
    },
    {
      id: "TEMPLATE" as CreationMethod,
      title: "Use template",
      description:
        "Browse our library of professionally designed pre-made templates.",
      icon: (
        <Layout
          size={48}
          className="text-gray-400 transition-colors group-hover:text-blue-600"
        />
      ),
      badge: null,
    },
    {
      id: "AI" as CreationMethod,
      title: "Generate with AI",
      description:
        "Let our advanced AI create intelligent questions based on your topic.",
      icon: (
        <Sparkles
          size={48}
          className="text-orange-400 transition-colors group-hover:text-orange-600"
        />
      ),
      badge: "NEW",
    },
  ];

  const handleContinue = () => {
    switch (selectedMethod) {
      case "SCRATCH":
        router.push("/dashboard/quiz/create");
        break;
      case "TEMPLATE":
        router.push("/dashboard/templates");
        break;
      case "AI":
        // For now, redirect to scratch as AI might not be implemented or has another route
        router.push("/dashboard/quiz/create?method=ai");
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[2.5rem] bg-[#F8FAFC] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 rounded-full p-2 text-gray-400 transition-all hover:bg-white hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-12 pb-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-black text-gray-900">
              Create a New Quiz
            </h2>
            <p className="mx-auto max-w-xl text-lg font-medium text-gray-500">
              Choose your preferred method to start building an engaging
              experience for your audience.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`group relative flex flex-col items-center rounded-[2rem] border-2 p-8 text-center transition-all duration-300 ${
                  selectedMethod === method.id
                    ? "scale-[1.02] border-blue-600 bg-white shadow-xl shadow-blue-500/10"
                    : "border-transparent bg-white/50 hover:border-gray-200 hover:bg-white"
                }`}
              >
                {method.badge && (
                  <span className="absolute top-6 right-6 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black text-white">
                    {method.badge}
                  </span>
                )}

                <div
                  className={`mb-8 rounded-2xl p-6 transition-all duration-300 ${
                    selectedMethod === method.id
                      ? "bg-blue-50"
                      : "bg-gray-100 group-hover:bg-gray-50"
                  }`}
                >
                  {method.icon}
                </div>

                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {method.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  {method.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center border-t border-gray-100 bg-white/50 p-12 pt-4">
          <div className="flex w-full justify-center gap-4">
            <button
              onClick={onClose}
              className="rounded-2xl px-8 py-3.5 text-base font-bold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="transform rounded-2xl bg-orange-500 px-12 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] hover:bg-orange-600 active:scale-[0.98]"
            >
              Continue to Editor
            </button>
          </div>
          <p className="mt-8 flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px]">
              i
            </span>
            You can always change these settings later in the quiz dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;
