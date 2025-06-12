"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from './chat-message';
import { ModelSelector, type Model } from "./model-selector";
import { ArrowDown, Settings, Paperclip, Search, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const router = useRouter();
  const [model, setModel] = useState<Model>("gemini-2.0");

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
  
  // ✨ REFS POUR LA TECHNIQUE DU "PADDING FANTÔME"
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 🎯 PADDING FANTÔME DYNAMIQUE - Mesure la hauteur du formulaire et applique le padding
  useEffect(() => {
    if (formRef.current && scrollAreaRef.current) {
      const formHeight = formRef.current.offsetHeight;
      scrollAreaRef.current.style.paddingBottom = `${formHeight + 20}px`;
    }
  }, [input, messages]); // Recalcule si l'input ou les messages changent

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
      <header className="flex items-center justify-between p-2 md:p-4 border-b bg-background shrink-0">
        <h2 className="text-lg font-semibold truncate">{chatTitle}</h2>
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* 🔄 ZONE DE SCROLL AVEC PADDING FANTÔME */}
      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto px-2 md:px-4 py-4 md:py-8">
          {messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} reload={reload} chatId={chatId} model={model} setMessages={setMessages} />
              ))}
              
              {/* 🤖 INDICATEUR DE CHARGEMENT ÉLÉGANT */}
              {isLoading && (
                <div className="flex items-start space-x-4">
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 pt-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">How can I help you?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
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
          
          {/* 🤖 INDICATEUR DE CHARGEMENT POUR ÉTAT VIDE */}
          {isLoading && messages.length === 0 && (
            <div className="flex items-start space-x-4 mt-8">
              <Avatar className="w-8 h-8 border">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll to Bottom Button */}
      {!isAtBottom && (
        <div className="absolute bottom-20 md:bottom-32 left-1/2 -translate-x-1/2 z-10">
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

      {/* 💫 INPUT FLOTTANT AVEC REF POUR MESURE DYNAMIQUE */}
      <div className="absolute bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl p-2 md:p-4">
        {/* 🚨 Message d'avertissement pour les conversations longues */}
        {messages.length > 20 && (
          <div className="text-center text-xs text-muted-foreground p-2 mb-2 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50">
            Conversation is getting long. For best performance, consider starting a{" "}
            <Link href="/chat" className="underline text-primary hover:text-primary/80">
              new chat
            </Link>
            .
          </div>
        )}
        <div className="relative rounded-2xl shadow-lg bg-background/80 backdrop-blur-md border border-primary/20">
          <form
            ref={formRef}
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
            className="p-2 md:p-4 flex flex-col gap-2 md:gap-4"
          >
            <div className="relative">
              {/* Le Textarea qui grandit automatiquement */}
              <TextareaAutosize
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask ${model.startsWith('gemini') ? 'Gemini' : 'Groq'}...`}
                className="w-full bg-transparent resize-none
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
            </div>
            
            {/* La barre d'outils en bas - séparation claire */}
            <div className="flex items-center justify-between">
              {/* Outils de gauche */}
              <div className="flex items-center gap-1 md:gap-2">
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
  );
} 