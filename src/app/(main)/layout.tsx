import { auth } from '@clerk/nextjs/server';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ChatHistory } from '@/components/custom/chat-history';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import Link from 'next/link';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  return (
    <div className="flex h-screen w-screen">
      <aside className="w-72 shrink-0 bg-gray-100 dark:bg-gray-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <Link href="/"><h1 className="text-lg font-bold">Cyberpunkchat</h1></Link>
          <ThemeToggle />
        </div>
        
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
            <p className="text-sm text-muted-foreground">
              Welcome! Sign in to save your conversations.
            </p>
            <SignInButton mode="modal">
              <Button className="w-full">Login to Chat</Button>
            </SignInButton>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col bg-background">
        {children}
      </main>
    </div>
  );
} 