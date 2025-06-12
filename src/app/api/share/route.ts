import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { chatId } = await req.json();

  // On génère un ID unique pour le partage
  const shareId = `shr_${nanoid(16)}`;

  // On met à jour le chat en BDD
  const updatedChats = await db
    .update(chats)
    .set({ sharePath: shareId })
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId))) // Sécurité : on vérifie que l'user possède bien le chat
    .returning({ sharePath: chats.sharePath });

  if (updatedChats.length === 0) {
    return new Response('Chat not found or permission denied', { status: 404 });
  }

  return NextResponse.json({ sharePath: updatedChats[0].sharePath });
} 