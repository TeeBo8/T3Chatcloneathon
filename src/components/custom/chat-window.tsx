"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { ModelSelector, type Model } from "./model-selector";
import Textarea from 'react-textarea-autosize';
import { Sparkles } from "lucide-react";

interface ChatWindowProps {
  chatId: string;
  initialMessages: Message[];
}

export function ChatWindow({ chatId, initialMessages }: ChatWindowProps) {
  const [model, setModel] = useState<Model>("groq");

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    // Le 'body' initial est toujours là, mais on va le surcharger
    body: {
      chatId: chatId,
    },
    initialMessages: initialMessages,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4">
        {messages.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className={`h-10 w-10 shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <AvatarFallback className={m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>{m.role === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/70 backdrop-blur-sm border border-border/50'
                  }`}
                >
                  <div className="prose dark:prose-invert prose-p:my-0 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 max-w-none break-words">
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
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
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
      </ScrollArea>

      <div className="p-6 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <div className="mx-auto max-w-4xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // On garde le handleSubmit de useChat, mais on empêche la soumission si l'input est vide
              if (!input.trim()) return;
              handleSubmit(e, {
                data: {
                  chatId: chatId,
                  model: model,
                },
              });
            }}
          >
            <div className="flex items-end gap-3">
              <div className="relative flex-1 flex h-full min-h-[60px] flex-col items-center justify-center rounded-3xl border border-border/50 bg-muted/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={`Type your message to ${model === 'gemini' ? 'Gemini' : 'Groq'}...`}
                  className="w-full resize-none self-center bg-transparent px-5 py-4 focus-within:outline-none placeholder:text-muted-foreground/70"
                  maxRows={5}
                  rows={1}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!input.trim()) return;
                      // Déclencher la soumission du formulaire
                      const form = e.currentTarget.closest('form');
                      if (form) {
                        form.requestSubmit();
                      }
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <ModelSelector model={model} onModelChange={setModel} />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="h-12 w-12 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <Sparkles className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 