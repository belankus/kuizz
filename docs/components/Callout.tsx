import type { ReactNode } from "react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type CalloutVariant = "info" | "warning" | "danger" | "tip" | "note";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const variantStyles: Record<CalloutVariant, string> = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  warning:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  tip: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
  note: "border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300",
};

const variantIcons: Record<CalloutVariant, string> = {
  info: "ℹ️",
  warning: "⚠️",
  danger: "🚨",
  tip: "💡",
  note: "📝",
};

export function Callout({ variant = "info", title, children }: CalloutProps) {
  return (
    <div
      className={cn("my-4 rounded-lg border px-4 py-3", variantStyles[variant])}
    >
      {title && (
        <p className="mt-0 mb-1 font-semibold">
          <span className="mr-2">{variantIcons[variant]}</span>
          {title}
        </p>
      )}
      <div className="text-sm [&>p]:my-0 [&>p:not(:last-child)]:mb-2">
        {children}
      </div>
    </div>
  );
}
