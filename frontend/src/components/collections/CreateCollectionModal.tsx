import React, { useState, useEffect } from "react";
import { X, Check, Camera, Info, Plus } from "lucide-react";
import { createCollection } from "@/lib/collections";
import { CollectionVisibility } from "@/types";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCollection: import("@/types").CollectionModelType) => void;
}

const COLORS = [
  { id: "purple", class: "bg-gradient-to-br from-purple-500 to-indigo-600" },
  { id: "blue", class: "bg-gradient-to-br from-blue-400 to-blue-600" },
  { id: "orange", class: "bg-gradient-to-br from-orange-400 to-amber-500" },
  { id: "green", class: "bg-gradient-to-br from-emerald-400 to-teal-500" },
];

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Private" },
  { value: "SHARED", label: "Shared" },
  { value: "PUBLIC", label: "Public" },
] as const;

export function CreateCollectionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCollectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CollectionVisibility>("PRIVATE");
  const [coverColorId, setCoverColorId] = useState("purple");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      setCoverColorId("purple");
      setCustomImage(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setCoverColorId("custom");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload: {
        name: string;
        description: string;
        visibility: CollectionVisibility;
        coverImageId?: string;
      } = {
        name,
        description,
        visibility,
      };

      // We pass coverImageId if it's one of the presets or a custom uploaded image ID
      // If customImage is used, ideally we'd upload it first.
      // For now we just pass the color ID as coverImageId.
      if (coverColorId !== "custom") {
        payload.coverImageId = coverColorId;
      }

      const newCollection = await createCollection(payload);
      onSuccess(newCollection);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create collection");
      } else {
        setError("Failed to create collection");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const helperText =
    visibility === "PRIVATE"
      ? "Only you can access this collection."
      : visibility === "SHARED"
        ? "Invite collaborators to contribute items."
        : "Anyone can discover and save this collection.";

  const activeColorClass =
    COLORS.find((c) => c.id === coverColorId)?.class || COLORS[0].class;
  const previewBackground = customImage ? `url(${customImage})` : "none";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl transition-all sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Create New Collection
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
          <form
            id="create-collection-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Collection Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marketing Quizzes 2024"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Description{" "}
                <span className="font-normal text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description of what this collection is for..."
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setCoverColorId(color.id);
                      setCustomImage(null);
                    }}
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-all hover:scale-105 ${color.class} ${coverColorId === color.id ? "ring-2 ring-purple-500 ring-offset-2" : ""}`}
                  >
                    {coverColorId === color.id && !customImage && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}

                <label
                  className={`group relative flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${coverColorId === "custom" ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"}`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  {customImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customImage}
                        alt="Custom cover"
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </>
                  ) : (
                    <>
                      <Camera className="mb-0.5 h-4 w-4 text-gray-400 group-hover:text-purple-500" />
                      <span className="text-[10px] font-medium text-gray-400 group-hover:text-purple-500">
                        Upload
                      </span>
                    </>
                  )}
                  {coverColorId === "custom" && customImage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Collection Preview */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Collection Preview
              </label>
              <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <div
                  className={`h-16 w-16 shrink-0 rounded-xl bg-cover bg-center ${!customImage ? activeColorClass : ""}`}
                  style={
                    customImage
                      ? { backgroundImage: previewBackground }
                      : undefined
                  }
                />
                <div className="flex min-w-0 flex-col justify-center">
                  <span className="mb-1 text-[10px] font-bold tracking-wider text-purple-600 uppercase">
                    {visibility} COLLECTION
                  </span>
                  <p className="truncate text-base font-semibold text-gray-900">
                    {name || "New Collection Name"}
                  </p>
                  <p className="text-xs text-gray-500">
                    0 Quizzes • Created by you
                  </p>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibility(opt.value)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                      visibility === opt.value
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <p>{helperText}</p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:flex-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-collection-form"
            disabled={!name.trim() || isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 sm:flex-none"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Collection
          </button>
        </div>
      </div>
    </div>
  );
}
