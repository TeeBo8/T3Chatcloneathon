import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Zap, Sparkles, Lock, Smartphone } from 'lucide-react';
import CyberpunkBackground from "@/components/custom/cyberpunk-background";

export default async function LandingPage() {
  const { userId } = await auth();

  // If the user is already logged in, redirect them to the chat page
  if (userId) {
    redirect("/chat");
  }

  return (
    <CyberpunkBackground>
      {/* BANDEAU MOBILE */}
      <div className="md:hidden flex items-center gap-2 p-2 mb-8 text-sm rounded-lg bg-primary/10 text-primary-foreground border border-primary/20">
        <Smartphone className="h-5 w-5" />
        <p>For the best experience, please use a desktop browser.</p>
      </div>

      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          <span className="text-cyan-100">Unleash the Power of AI with</span>{" "}
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-500 to-pink-600 bg-clip-text text-transparent">
            Cyberpunkchat
          </span>
        </h1>
        <p className="text-lg md:text-xl text-cyan-300/80 mb-4">
          A lightning-fast, open-source AI chat application built with NextJS, Groq and Gemini.
          Experience a superior UI/UX, designed for developers and creators.
        </p>
        <p className="text-sm md:text-base text-cyan-400/70 mb-8 font-mono">
          Powered by Groq and Gemini
        </p>
        <Link href="/chat">
          <Button size="lg" variant="secondary">
            Start Chatting Now
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 md:mt-20 max-w-4xl text-center">
        <div className="flex flex-col items-center">
          <Zap className="h-10 w-10 text-cyan-400 mb-2" />
          <h3 className="font-semibold text-xl text-cyan-100">Blazing Fast</h3>
          <p className="text-cyan-300/70">Powered by Groq for near-instant AI responses.</p>
        </div>
        <div className="flex flex-col items-center">
          <Sparkles className="h-10 w-10 text-cyan-400 mb-2" />
          <h3 className="font-semibold text-xl text-cyan-100">Sleek Interface</h3>
          <p className="text-cyan-300/70">Polished UI/UX with light/dark modes and markdown support.</p>
        </div>
        <div className="flex flex-col items-center">
          <Lock className="h-10 w-10 text-cyan-400 mb-2" />
          <h3 className="font-semibold text-xl text-cyan-100">Secure & Private</h3>
          <p className="text-cyan-300/70">Your conversations are your own. Secure authentication by Clerk.</p>
        </div>
      </div>
    </CyberpunkBackground>
  );
}
