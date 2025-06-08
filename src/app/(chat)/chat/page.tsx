"use client";

import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ChatPage() {
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: () => {
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id} className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {m.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-bold">
                    {m.role === "user" ? "You" : "AI"}
                  </p>
                  <p className="text-foreground/90 whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
              <p className="text-center text-gray-500">
                Start a new conversation
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
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
} 