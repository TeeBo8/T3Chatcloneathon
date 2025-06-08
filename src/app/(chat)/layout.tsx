import React from "react";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChatHistory } from "@/components/custom/chat-history";

// Let's create placeholder components for now.
// We'll build them out properly in the next step.
const Sidebar = () => (
    <aside className="w-64 shrink-0 bg-gray-100 dark:bg-gray-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold">T3 Cloneathon</div>
            <ThemeToggle />
        </div>
        
        {/* Replace the placeholder div with our dynamic component */}
        <div className="flex-1 overflow-y-auto">
            <ChatHistory />
        </div>

        <div className="border-t border-primary/20 pt-4 flex items-center justify-center">
            <SignedIn>
                {/* Affiche le bouton de profil si l'utilisateur est connecté */}
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
                {/* Affiche le bouton de connexion si l'utilisateur n'est pas connecté */}
                <SignInButton mode="modal">
                    <Button>Login to Chat</Button>
                </SignInButton>
            </SignedOut>
        </div>
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