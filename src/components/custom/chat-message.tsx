"use client"
import { type Message } from "ai";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from "./code-block";
import { Button } from "../ui/button";
import { Copy, Edit, RefreshCw, Trash2, Check } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  reload?: (options?: { data?: { chatId: string; model: string } }) => void;
  chatId: string;
  model: string;
}

export function ChatMessage({ message, reload, chatId, model }: ChatMessageProps) {
  const { role, content } = message;
  const isAssistant = role === 'assistant';
  const isUser = role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReload = () => {
    if (reload) {
      reload({
        data: {
          chatId: chatId,
          model: model,
        }
      });
    }
  };

  return (
    <div className={`group relative flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback>{role === "user" ? "U" : "AI"}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {isUser ? (
          // Le message de l'utilisateur est dans une bulle à DROITE
          <div className="rounded-lg bg-primary p-3 text-primary-foreground ml-auto max-w-[80%]">
            <div className="prose prose-p:my-0 break-words">
              <ReactMarkdown>
                {content}
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
                    <code className="px-1.5 py-0.5 rounded-md font-mono text-sm bg-primary/20 text-primary" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* 🚀 LA TOOLBAR D'ACTIONS MAGIQUE - Apparaît au survol */}
      {isAssistant && (
        <div className="absolute -top-2 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit prompt">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleReload} title="Regenerate response">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopy} title="Copy">
            {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 