import React from "react";

export function CollectionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {children}
    </div>
  );
}
