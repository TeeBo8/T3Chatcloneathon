"use client"

import { useChat } from "ai/react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage } from './chat-message';
import { ModelSelector, type Model } from "./model-selector";
import { ArrowDown, ArrowUp, Settings, Paperclip, Search, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [model, setModel] = useState<Model>("deepseek-free");

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, data, reload, setMessages, error } = useChat({
    api: '/api/chat',
    initialMessages: initialMessages,
    body: {
      chatId: chatId,
      model: model,
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      console.log('Erreur détectée:', error);
      const errorMessage = error.message.toLowerCase();
      
      // On vérifie simplement si le message d'erreur CONTIENT 'unauthorized' ou le code '401'
      // C'est beaucoup plus robuste que de parser du JSON.
      if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
        toast.info("Please sign in to continue the conversation.");
        if (input.trim()) {
          localStorage.setItem('cyberpunk-last-prompt', input);
        }
        openSignIn();
      } else {
        // Pour toutes les autres erreurs
        toast.error("An error occurred. Please try again.");
      }
    }
  }, [error, openSignIn, input]);

  useEffect(() => {
    if (isSignedIn) {
      const lastPrompt = localStorage.getItem('cyberpunk-last-prompt');
      if (lastPrompt) {
        console.log('🎯 Restauration du prompt:', lastPrompt);
        
        setInput(lastPrompt);
        localStorage.removeItem('cyberpunk-last-prompt');
        
        const submitPrompt = () => {
          if (formRef.current && !isLoading) {
            console.log('🚀 Soumission automatique du prompt restauré');
            formRef.current.requestSubmit();
          } else {
            setTimeout(submitPrompt, 100);
          }
        };
        
        setTimeout(submitPrompt, 1000);
      }
    }
  }, [isSignedIn, setInput, isLoading]);

  useEffect(() => {
    if (isSignedIn && messages.length === 0) {
      const lastPrompt = localStorage.getItem('cyberpunk-last-prompt');
      if (lastPrompt) {
        console.log('🎯 Prompt trouvé au démarrage:', lastPrompt);
        setInput(lastPrompt);
        localStorage.removeItem('cyberpunk-last-prompt');
        
        setTimeout(() => {
          if (formRef.current) {
            console.log('🚀 Soumission du prompt au démarrage');
            formRef.current.requestSubmit();
          }
        }, 500);
      }
    }
  }, [isSignedIn, messages.length, setInput]);

  useEffect(() => {
    if (formRef.current && scrollAreaRef.current) {
      const formHeight = formRef.current.offsetHeight;
      scrollAreaRef.current.style.paddingBottom = `${formHeight + 20}px`;
    }
  }, [input, messages]);

  useEffect(() => {
    if (!chatId && data && data.length > 0) {
      const newChatData = data.find((d): d is { newChatId: string } => 
        d !== null && typeof d === 'object' && 'newChatId' in d
      );
      if (newChatData?.newChatId) {
        console.log('🎯 Redirection vers la nouvelle conversation:', newChatData.newChatId);
        router.push(`/chat/${newChatData.newChatId}`);
      }
    }
  }, [data, router, chatId]);

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);
  
  // Détection du scroll améliorée
  useEffect(() => {
    const container = scrollAreaRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop <= clientHeight + 1; // +1 pour la marge d'erreur
      setIsAtBottom(atBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Vérifie l'état initial

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const chatTitle = initialMessages.length > 0 
    ? initialMessages.find(m => m.role === 'user')?.content.substring(0, 50) + '...' || 'New Chat'
    : 'New Chat';

  // Fonction pour scroller vers le prompt précédent  
  const scrollToPreviousPrompt = () => {
    const container = scrollAreaRef.current;
    if (!container) return;
    
    // On cherche tous les messages utilisateur
    const userMessages = Array.from(container.querySelectorAll('[data-role="user"]'));
    if (userMessages.length > 1) {
      // Prend l'avant-dernier message utilisateur
      const targetMessage = userMessages[userMessages.length - 2];
      targetMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full relative">
      <header className="flex items-center justify-between p-2 md:p-4 border-b bg-background shrink-0">
        <h2 className="text-lg font-semibold truncate">{chatTitle}</h2>
        {isSignedIn && (
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        )}
      </header>

      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto px-2 md:px-4 py-4 md:py-8">
          {messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((m) => (
                <div key={m.id} data-role={m.role}>
                  <ChatMessage message={m} reload={reload} chatId={chatId} model={model} setMessages={setMessages} />
                </div>
              ))}
              
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
              <h2 className="text-xl md:text-2xl font-bold mb-4">How can I help you, choom?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Button 
                  variant="outline" 
                  className="bg-background/50 backdrop-blur-sm" 
                  onClick={() => handleSuggestionClick('Tell me about the development of Cyberpunk 2077: the hype, delays, and launch issues.')}
                >
                  Cyberpunk 2077: Development Hell
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-background/50 backdrop-blur-sm" 
                  onClick={() => handleSuggestionClick('Describe the world of Night City: the factions, the tech, and key characters.')}
                >
                  The World of Night City
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-background/50 backdrop-blur-sm" 
                  onClick={() => handleSuggestionClick('Explain the gameplay mechanics of Cyberpunk 2077: classes, skills, and weapons.')}
                >
                  Gameplay & Mechanics
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-background/50 backdrop-blur-sm" 
                  onClick={() => handleSuggestionClick('Summarize the critical reception of Cyberpunk 2077, both positive and negative, and the impact of its updates.')}
                >
                  Critical Reception & Redemption
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-8">
                ...or ask anything else. The sky is the limit.
              </p>
            </div>
          )}
          
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
      
      {/* BOUTONS DE SCROLL FLOTTANTS */}
      <div className="absolute bottom-24 md:bottom-32 right-4 md:right-8 flex flex-col gap-2 z-10">
        {!isAtBottom && (
          <Button 
            onClick={scrollToBottom}
            size="icon" 
            variant="outline" 
            className="rounded-full bg-background/80 hover:bg-background/100 border-primary/20 backdrop-blur-sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
        {messages.filter(m => m.role === 'user').length > 1 && (
          <Button 
            onClick={scrollToPreviousPrompt}
            size="icon" 
            variant="outline" 
            className="rounded-full bg-background/80 hover:bg-background/100 border-primary/20 backdrop-blur-sm"
            title="Scroll to previous prompt"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl p-2 md:p-4">
        {messages.length > 20 && (
          <div className="text-center text-xs text-muted-foreground p-2 mb-2 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50">
            Conversation is getting long. For best performance, consider starting a{" "}
            <Link href="/" className="underline text-primary hover:text-primary/80">
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
              <TextareaAutosize
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask ${
                  model.startsWith('llama') ? 'Llama' :
                  model.startsWith('gemini') ? 'Gemini' : 
                  model.startsWith('deepseek') ? 'DeepSeek' : 
                  'Groq'
                }...`}
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 md:gap-2">
                <ModelSelector model={model} onModelChange={setModel} />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Search (coming soon)">
                  <Search className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Attach file (coming soon)">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              
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