import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { DeleteChatButton } from "./delete-chat-button";
import { NewChatButton } from "./new-chat-button";

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
      <NewChatButton />
      <div className="flex-1 flex-col-reverse overflow-y-auto space-y-1">
        {userChats.map((chat) => (
          <div key={chat.id} className="group relative flex items-center">
            <Link href={`/chat/${chat.id}`} className="flex-1 truncate p-2 pr-8 rounded-md hover:bg-primary/10 transition-colors">
              {chat.title}
            </Link>
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 bg-gradient-to-l from-background via-background/80 to-transparent group-hover:from-background/90">
              <DeleteChatButton chatId={chat.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 