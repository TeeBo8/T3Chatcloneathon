import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ChatWindow } from "@/components/custom/chat-window";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { chatId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  // Vérifier que le chat appartient à l'utilisateur
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
  });

  if (!chat) {
    notFound();
  }

  // Récupérer les messages du chat
  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
  });

  // Convertir au format Message[] attendu par ChatWindow
  const formattedMessages = chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  return (
    <ChatWindow 
      chatId={chatId} 
      initialMessages={formattedMessages} 
    />
  );
} 