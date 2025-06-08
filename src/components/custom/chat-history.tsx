import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";

// This is a React Server Component
export async function ChatHistory() {
  const { userId } = await auth();
  if (!userId) {
    return null; // Or some other UI for logged-out state
  }

  // Fetch the chat history for the current user
  const userChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId));

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <Link href="/chat">
        <Button variant="outline" className="w-full mb-4">
          <MessageSquare className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </Link>
      <div className="flex-1 flex-col-reverse overflow-y-auto space-y-1">
        {userChats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div className="truncate p-2 rounded-md hover:bg-primary/10 transition-colors">
              {chat.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 