"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from './chat-message';
import { ModelSelector, type Model } from "./model-selector";
import Textarea from 'react-textarea-autosize';
import { Sparkles, ArrowDown, Settings } from "lucide-react";
import Link from "next/link";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const router = useRouter();
  const [model, setModel] = useState<Model>("groq");

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, data, reload } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages,
    body: {
      chatId: chatId,
      model: model,
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 🚀 EFFET MAGIQUE : Écoute les données du serveur et redirige vers la nouvelle conversation
  useEffect(() => {
    if (data && data.length > 0) {
      const newChatData = data.find((d): d is { newChatId: string } => 
        d !== null && typeof d === 'object' && 'newChatId' in d
      );
      if (newChatData?.newChatId) {
        console.log('🎯 Redirection vers la nouvelle conversation:', newChatData.newChatId);
        router.push(`/chat/${newChatData.newChatId}`);
        router.refresh();
      }
    }
  }, [data, router]);

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);
  
  // Intersection Observer for the "scroll to bottom" button
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0.8 }
    );

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Génération intelligente du titre du chat
  const chatTitle = initialMessages.length > 0 
    ? initialMessages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'New Chat'
    : 'New Chat';

  return (
    <div className="flex flex-col h-full">
      {/* HEADER DE LA ZONE DE CHAT */}
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <h2 className="text-lg font-semibold truncate">{chatTitle}</h2>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* Main chat area qui prend tout l'espace disponible */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length > 0 ? (
            <>
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} reload={reload} chatId={chatId} model={model} />
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h2 className="text-2xl font-bold mb-2">How can I help you?</h2>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <Button variant="outline" onClick={() => handleSuggestionClick('How does AI work?')}>
                  How does AI work?
                </Button>
                <Button variant="outline" onClick={() => handleSuggestionClick('What is the meaning of life?')}>
                  What is the meaning of life?
                </Button>
                <Button variant="outline" onClick={() => handleSuggestionClick('Create a poem about a robot')}>
                  Create a poem about a robot
                </Button>
                <Button variant="outline" onClick={() => handleSuggestionClick('Explain quantum computing in simple terms')}>
                  Explain quantum computing
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll to Bottom Button */}
      {!isAtBottom && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <Button 
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })} 
            size="icon" 
            variant="outline" 
            className="rounded-full bg-background/80 hover:bg-background/100 border-primary/20 backdrop-blur-sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input area fixe */}
      <div className="p-4 bg-background">
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              handleSubmit(e, {
                data: {
                  chatId: chatId,
                  model: model,
                },
              });
            }}
          >
            <div className="relative flex h-full min-h-[40px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-end gap-3 w-full p-3">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder={`Type your message to ${model === 'gemini' ? 'Gemini' : 'Groq'}...`}
                    className="w-full resize-none bg-transparent focus-within:outline-none placeholder:text-muted-foreground/70 border-0"
                    maxRows={5}
                    rows={1}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!input.trim()) return;
                        const form = e.currentTarget.closest('form');
                        if (form) {
                          form.requestSubmit();
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ModelSelector model={model} onModelChange={setModel} />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isLoading || !input.trim()}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 