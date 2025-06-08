import React from "react";
import { ThemeToggle } from "@/components/custom/theme-toggle"; // Import the toggle button

// Let's create placeholder components for now.
// We'll build them out properly in the next step.
const Sidebar = () => (
    <aside className="w-64 shrink-0 bg-gray-100 dark:bg-gray-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold">T3 Cloneathon</div>
            <ThemeToggle />
        </div>
        {/* Placeholder for New Chat button and chat history */}
        <div className="flex-1"></div>
    </aside>
);

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white dark:bg-black">
        {children}
      </main>
    </div>
  );
} 