import { auth } from '@clerk/nextjs/server';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ChatHistory } from '@/components/custom/chat-history';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Crée un composant réutilisable pour le contenu de la sidebar
const SidebarContent = ({ userId }: { userId: string | null }) => {
  return (
    <>
      {userId ? (
        <>
          <div className="flex-1 overflow-y-auto">
            <ChatHistory />
          </div>
          <div className="border-t border-primary/20 pt-4 flex items-center justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 items-center justify-center text-center space-y-4">
          <p className="text-sm text-muted-foreground">Welcome! Sign in to save your conversations.</p>
          <SignInButton mode="modal">
            <Button className="w-full">Login to Chat</Button>
          </SignInButton>
        </div>
      )}
    </>
  );
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar Desktop */}
      <aside className="w-72 shrink-0 bg-gray-100 dark:bg-gray-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link href="/"><h1 className="text-lg font-bold">Cyberpunkchat</h1></Link>
          <ThemeToggle />
        </div>
        <SidebarContent userId={userId} />
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 flex flex-col bg-background">
        {/* Header Mobile */}
        <header className="md:hidden flex items-center justify-between p-2 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
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
              <SidebarContent userId={userId} />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">New Chat</span>
          <ThemeToggle />
        </header>
        {children}
      </main>
    </div>
  );
} 