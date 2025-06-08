import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Sparkles, Lock } from 'lucide-react';

export default async function LandingPage() {
  const { userId } = await auth();

  // If the user is already logged in, redirect them to the chat page
  if (userId) {
    redirect("/chat");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-foreground">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Unleash the Power of AI with{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            T3 Cloneathon
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          A lightning-fast, open-source AI chat application built with Next.js and Groq.
          Experience a superior UI/UX, designed for developers and creators.
        </p>
        <Link href="/chat">
          <Button size="lg">
            Start Chatting Now
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl text-center">
        <div className="flex flex-col items-center">
          <Zap className="h-10 w-10 text-primary mb-2" />
          <h3 className="font-semibold text-xl">Blazing Fast</h3>
          <p className="text-muted-foreground">Powered by Groq for near-instant AI responses.</p>
        </div>
        <div className="flex flex-col items-center">
          <Sparkles className="h-10 w-10 text-primary mb-2" />
          <h3 className="font-semibold text-xl">Sleek Interface</h3>
          <p className="text-muted-foreground">Polished UI/UX with light/dark modes and markdown support.</p>
        </div>
        <div className="flex flex-col items-center">
          <Lock className="h-10 w-10 text-primary mb-2" />
          <h3 className="font-semibold text-xl">Secure & Private</h3>
          <p className="text-muted-foreground">Your conversations are your own. Secure authentication by Clerk.</p>
        </div>
      </div>
    </main>
  );
}
