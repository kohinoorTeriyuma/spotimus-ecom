import React from "react";

export default function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-charcoal animate-spin rounded-full`}
        role="status"
        id="loading-spinner"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
