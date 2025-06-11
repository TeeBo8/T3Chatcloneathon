"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from './chat-message';
import { ModelSelector, type Model } from "./model-selector";
import { ArrowDown, Settings, Paperclip, Search, Send } from "lucide-react";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const router = useRouter();
  const [model, setModel] = useState<Model>("groq");

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, data, reload, setMessages } = useChat({
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
      { root: null, rootMargin: "0px 0px -120px 0px", threshold: 0.1 }
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
    <div className="flex flex-col h-full relative">
      {/* HEADER DE LA ZONE DE CHAT */}
      <header className="flex items-center justify-between p-4 border-b bg-background shrink-0">
        <h2 className="text-lg font-semibold truncate">{chatTitle}</h2>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* Main chat area qui prend tout l'espace disponible */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
          {messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} reload={reload} chatId={chatId} model={model} setMessages={setMessages} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
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
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
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

      {/* INPUT FLOTTANT - VERSION STRUCTURÉE T3.CHAT */}
      <div className="shrink-0 w-full bg-background/10 backdrop-blur-md p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl shadow-lg bg-background/80 backdrop-blur-md border border-primary/20 p-3">
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
              {/* Le Textarea qui grandit automatiquement */}
              <TextareaAutosize
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask ${model === 'gemini' ? 'Gemini' : 'Groq'}...`}
                className="w-full bg-transparent resize-none p-2 
                           border-none 
                           focus:ring-0 
                           focus-visible:ring-0 
                           focus-visible:ring-offset-0 
                           outline-none 
                           shadow-none"
                minRows={1}
                maxRows={5}
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
              
              {/* La barre d'outils en bas - séparation claire */}
              <div className="flex items-center justify-between mt-2 pt-2">
                {/* Outils de gauche */}
                <div className="flex items-center gap-2">
                  <ModelSelector model={model} onModelChange={setModel} />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Search (coming soon)">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Attach file (coming soon)">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Bouton d'envoi à droite */}
                <Button 
                  type="submit" 
                  size="icon" 
                  className="h-8 w-8" 
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 