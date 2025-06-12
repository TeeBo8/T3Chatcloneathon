import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NewChatButton } from "./new-chat-button";
import { ChatHistoryList } from "./chat-history-list"; // Importe le client component

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
      {/* On passe les données au composant client */}
      <ChatHistoryList userChats={userChats} />
    </div>
  );
} 