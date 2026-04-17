"use client";

/**
 * Skip navigation links for screen readers and keyboard users
 * Allows bypassing repetitive navigation to reach main content
 */
export function SkipNavigation() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-2 left-2 z-[9999] px-4 py-2 bg-orange-600 text-white font-semibold rounded-md 
                   transform -translate-y-full focus:translate-y-0 transition-transform duration-200
                   focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-2 left-32 z-[9999] px-4 py-2 bg-orange-600 text-white font-semibold rounded-md 
                   transform -translate-y-full focus:translate-y-0 transition-transform duration-200
                   focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
      >
        Skip to navigation
      </a>
    </div>
  );
}