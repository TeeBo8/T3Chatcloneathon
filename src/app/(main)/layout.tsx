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
      
      {/* -- LIEN STEAM EN FOOTER DE SIDEBAR -- */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <Link 
          href="https://store.steampowered.com/app/1091500/Cyberpunk_2077/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad-2">
            <line x1="6" x2="6" y1="11" y2="17"/>
            <line x1="10" x2="10" y1="13" y2="15"/>
            <path d="M17.28 9.04a5 5 0 1 0-10.56 0"/>
            <path d="M12 18H5.5a2 2 0 0 0-2 2v1h13v-1a2 2 0 0 0-2-2H12Z"/>
          </svg>
          Inspired by Cyberpunk 2077
        </Link>
      </div>
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