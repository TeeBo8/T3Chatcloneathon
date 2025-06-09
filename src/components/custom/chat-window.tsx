"use client"

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Message } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { ModelSelector, type Model } from "./model-selector";

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

  // NOTRE NOUVELLE FONCTION DE SOUMISSION
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    // On appelle le handleSubmit de useChat, mais en lui passant
    // un nouveau corps de requête avec le modèle ACTUEL.
    handleSubmit(e, {
      data: {
        chatId: chatId,
        model: model, // <-- La valeur fraîche et correcte !
      },
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1 p-4">
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-4">
                <Avatar className="shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {m.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground mb-2">
                    {m.role === "user" ? "You" : "AI"}
                  </p>
                  <div className="prose dark:prose-invert max-w-none break-words prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-h1:text-foreground prose-h2:text-foreground prose-h3:text-foreground">
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
                            <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props}>
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

      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between">
            <ModelSelector model={model} onModelChange={setModel} />
            <Button type="submit" disabled={isLoading}>Send</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 