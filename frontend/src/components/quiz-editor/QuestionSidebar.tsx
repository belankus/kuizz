"use client";

import React from "react";
import { useQuizEditorStore } from "@/store/quiz-editor/useQuizEditorStore";
import { Plus, Database } from "lucide-react";
import ImportBankModal from "../import-bank/ImportBankModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableQuestionItem from "./SortableQuestionItem";

const QuestionSidebar: React.FC = () => {
  const {
    questions,
    selectedQuestionId,
    selectQuestion,
    addQuestion,
    removeQuestion,
    reorderQuestions,
  } = useQuizEditorStore();
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      reorderQuestions(oldIndex, newIndex);
    }
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r bg-gray-50">
      <div className="border-b bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            Questions
          </span>
          <span className="text-xs font-medium text-gray-400">
            {questions.length} Total
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, index) => (
              <SortableQuestionItem
                key={q.id}
                question={q}
                index={index}
                isSelected={selectedQuestionId === q.id}
                onSelect={selectQuestion}
                onRemove={removeQuestion}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          onClick={() => addQuestion({})}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white/50 py-3 text-sm font-medium text-gray-600 transition-all hover:border-orange-400 hover:text-orange-600"
        >
          <Plus size={16} />
          Add Question
        </button>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-200 bg-white/50 py-3 text-sm font-medium text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-50"
        >
          <Database size={16} />
          Import from Bank
        </button>
      </div>

      <ImportBankModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <div className="border-t bg-white p-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="mb-1 text-[10px] font-bold text-blue-600 uppercase">
            Quick Tip
          </p>
          <p className="text-[11px] leading-relaxed text-blue-700">
            Use <kbd className="rounded border bg-white px-1">Cmd + K</kbd> to
            search for questions in the bank.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default QuestionSidebar;
