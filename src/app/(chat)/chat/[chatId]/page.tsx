"use client";

import { use } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PageProps {
  params: Promise<{
    chatId: string;
  }>;
}

// NOTE: This component is a placeholder for a more robust implementation
// where initial messages would be fetched from the server.
// For this MVP, we rely on the `useChat` hook's state.
// We will improve this by fetching initial messages via a server component.

export default function SpecificChatPage({ params }: PageProps) {
  const { chatId } = use(params);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      chatId: chatId
    },
    // We would fetch initial messages here, but for now we leave it to the user to continue the conversation.
    // initialMessages: fetchedMessages, 
  });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>{m.role === "user" ? "U" : "AI"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">{m.role === "user" ? "You" : "AI"}</p>
                  <p className="text-foreground/90 whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
              <p className="text-center text-gray-500">
                This chat is empty. Start typing to continue the conversation.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-primary/20">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>Send</Button>
        </form>
      </div>
    </div>
  );
} 