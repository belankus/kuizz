"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Question } from "@/store/quiz-editor/useQuizEditorStore";

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(question.id)}
      className={`group cursor-pointer rounded-lg border p-3 transition-all ${
        isSelected
          ? "border-orange-200 bg-orange-50 ring-1 ring-orange-200"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
          Q{index + 1}
        </span>
        <span className="flex-1 truncate text-[10px] font-medium text-gray-500">
          {question.type.replace("_", " ")}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(question.id);
          }}
          className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <p className="ml-5 line-clamp-2 text-sm leading-tight font-medium text-gray-700">
        {question.content || "Untitled Question"}
      </p>
    </div>
  );
};

export default SortableQuestionItem;
