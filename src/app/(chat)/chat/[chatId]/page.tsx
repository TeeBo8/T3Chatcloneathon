import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ChatWindow } from "@/components/custom/chat-window";
import { chats } from "@/lib/db/schema";
import { type Message } from "ai";

interface SpecificChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function SpecificChatPage({ params }: SpecificChatPageProps) {
  const { chatId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  // Security check: Ensure the user owns this chat
  const userChats = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  if (userChats.length === 0) {
    return redirect("/chat"); // Or show a "not found" page
  }

  // Fetch initial messages for the chat
  const initialMessagesData = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  // Map the database results to the format expected by Vercel AI SDK
  const initialMessages: Message[] = initialMessagesData.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <ChatWindow 
      chatId={chatId} 
      initialMessages={initialMessages} 
    />
  );
} 