import { db } from '@/lib/db';
import { chats, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SharedPageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export default async function SharedPage({ params }: SharedPageProps) {
  // Await params avant utilisation (Next.js 15)
  const { shareId } = await params;
  
  // Récupérer le chat par son sharePath
  const sharedChats = await db
    .select()
    .from(chats)
    .where(eq(chats.sharePath, shareId));

  if (sharedChats.length === 0) {
    return notFound(); // Affiche la page 404 de Next.js
  }
  
  const chat = sharedChats[0];

  // Récupérer les messages de ce chat
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chat.id))
    .orderBy(messages.createdAt);

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4">{chat.title}</h1>
      <div className="space-y-8 border rounded-lg p-4">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="flex-1">
              {msg.role === 'user' ? (
                // Message utilisateur
                <div className="rounded-lg bg-primary p-3 text-primary-foreground ml-auto max-w-[80%]">
                  <div className="prose prose-p:my-0 break-words">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                // Message assistant
                <div className="prose dark:prose-invert prose-p:my-0 max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
} 