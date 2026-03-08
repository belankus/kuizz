import { cn } from "@/lib/utils";

interface CollectionsTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function CollectionsTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: CollectionsTabsProps) {
  return (
    <div
      className={cn(
        "no-scrollbar flex w-full items-center gap-8 overflow-x-auto border-b border-gray-200",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative pt-2 pb-4 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "text-orange-600"
                : "text-gray-500 hover:text-gray-900",
            )}
          >
            {tab}
            {isActive && (
              <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full bg-orange-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
