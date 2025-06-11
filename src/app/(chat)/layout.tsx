import React, { Suspense } from "react";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ChatHistory } from "@/components/custom/chat-history";
import { ChatHistorySkeleton } from "@/components/custom/chat-history-skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const SidebarContent = () => (
  <>
    <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<ChatHistorySkeleton />}>
          <ChatHistory />
        </Suspense>
    </div>

    <div className="border-t border-primary/20 pt-4 flex items-center justify-center">
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
            <SignInButton mode="modal">
                <Button>Login to Chat</Button>
            </SignInButton>
        </SignedOut>
    </div>
  </>
);

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen">
      {/* Desktop Sidebar */}
      <aside className="w-72 shrink-0 bg-gray-100 dark:bg-gray-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold">Cyberpunkchat</div>
            <ThemeToggle />
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-2 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4 flex flex-col">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left">Cyberpunkchat</SheetTitle>
              </SheetHeader>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </header>
        
        {children}
      </main>
    </div>
  );
} 