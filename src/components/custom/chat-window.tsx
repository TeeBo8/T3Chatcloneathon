"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { ModelSelector, type Model } from "./model-selector";
import Textarea from 'react-textarea-autosize';
import { Sparkles, ArrowDown } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const [model, setModel] = useState<Model>("groq");

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      chatId: chatId,
    },
    initialMessages: initialMessages,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

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

  return (
    <div className="flex flex-col h-full">
      {/* Main chat area qui prend tout l'espace disponible */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length > 0 ? (
            <>
              {messages.map((m) => (
                <div key={m.id} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>{m.role === "user" ? "U" : "AI"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {m.role === 'user' ? (
                      // Le message de l'utilisateur est dans une bulle à DROITE
                      <div className="rounded-lg bg-primary p-3 text-primary-foreground ml-auto max-w-[80%]">
                        <div className="prose prose-p:my-0 break-words">
                          <ReactMarkdown>
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      // Le message de l'IA à GAUCHE, juste le texte
                      <div className="prose dark:prose-invert prose-p:my-0 max-w-none break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children, ...props }: React.HTMLProps<HTMLElement>) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');
                              const inline = !className?.includes('language-');
                              
                              return !inline && match ? (
                                <CodeBlock
                                  language={match[1]}
                                  value={codeString}
                                />
                              ) : (
                                <code className={`px-1.5 py-0.5 rounded-md font-mono text-sm ${
                                  m.role === 'user' 
                                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                                    : 'bg-primary/20 text-primary'
                                }`} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
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
            className="rounded-full"
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