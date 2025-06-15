"use client"
import { type Message } from "ai";
import React, { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from "./code-block";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Copy, Edit, RefreshCw, Trash2, Check, X } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  reload?: (options?: { data?: { chatId: string; model: string } }) => void;
  chatId: string;
  model: string;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
}

export const ChatMessage = React.memo(function ChatMessage({ message, reload, chatId, model, setMessages }: ChatMessageProps) {
  const { id, role, content } = message;
  const isAssistant = role === 'assistant';
  const isUser = role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  const handleSaveEdit = async () => {
    // 1. Met à jour l'UI immédiatement pour une UX fluide
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === id ? { ...msg, content: editedContent } : msg
      )
    );
    setIsEditing(false);

    // 2. Envoie la mise à jour au serveur en arrière-plan
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, newContent: editedContent }),
      });
    } catch (error) {
      console.error('Failed to save edit:', error);
      // TODO: Ajouter un toast d'erreur pour l'utilisateur
    }
  };

  const handleDelete = async () => {
    // 1. Met à jour l'UI immédiatement
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
    
    // 2. Envoie la requête de suppression au serveur en arrière-plan
    try {
      await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id }),
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      // TODO: Ajouter un toast d'erreur pour l'utilisateur
    }
  };

  return (
    <div className={`group relative ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className="flex-1 min-w-0">
        {isUser ? (
          // Le message de l'utilisateur est dans une bulle à DROITE
          <div className="rounded-lg bg-primary p-3 text-primary-foreground ml-auto max-w-[80%]">
            <div className="prose prose-p:my-0 break-words">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        ) : isAssistant && isEditing ? (
          // Mode édition pour les messages de l'IA
          <div className="space-y-3">
            <Textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="Edit the AI response..."
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // Le message de l'IA à GAUCHE, mode affichage normal avec bordure stylée
          <div className="overflow-hidden rounded-md transition-colors group-hover:bg-primary/5 p-3">
            <div className="prose dark:prose-invert prose-p:my-0 max-w-full break-words">
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
          </div>
        )}
      </div>

      {/* 🚀 LA TOOLBAR D'ACTIONS MAGIQUE - Apparaît au survol (seulement en mode non-édition) */}
      {isAssistant && !isEditing && (
        <div className="absolute -top-2 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleEdit} title="Edit response">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleReload} title="Regenerate response">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCopy} title="Copy">
            {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDelete} title="Delete message">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}); 