import { streamText, createDataStreamResponse } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { chats, messages as _messages, userSubscriptions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// Import and initialize model providers
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();
    const { chatId: currentChatId, model: modelProvider } = data;
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // --- DÉBUT DE LA LOGIQUE DU LIMITEUR ---
    const adminUserId = process.env.ADMIN_USER_ID;
    const MESSAGE_LIMIT = 20;
    let limitExceeded = false;

    // On applique la logique uniquement si l'utilisateur n'est pas l'admin
    if (userId !== adminUserId) {
      const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId),
      });

      if (subscription && subscription.messageCount >= MESSAGE_LIMIT) {
        limitExceeded = true;
      }
    }

    if (limitExceeded) {
      return new Response('Message limit exceeded. Please upgrade your plan.', { status: 429 });
    }
    // --- FIN DE LA LOGIQUE DU LIMITEUR ---

    const userMessage = messages[messages.length - 1];
    
    // Vérification des clés API
    if (modelProvider === 'gemini' && !process.env.GEMINI_API_KEY) {
      console.error('❌ ERREUR: GEMINI_API_KEY manquante dans .env.local');
      return new Response('Gemini API key not configured', { status: 500 });
    }
    
    // Select the model based on the provider string from the client
    const model = modelProvider === 'gemini' 
      ? google('models/gemini-1.5-flash') 
      : groq('llama3-8b-8192');

    // 🚀 NOUVELLE APPROCHE : Utilisation de createDataStreamResponse
    return createDataStreamResponse({
      execute: dataStream => {
        const result = streamText({
          model: model,
          messages: messages,
          onFinish: async ({ text }) => {
            // This is where we save the conversation to the database
            const title = messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Chat';
            let chatId = currentChatId;

            // If it's a new chat, create a chat entry first
            if (!chatId) {
              const newChatId = nanoid();
              // 🎯 MAGIE : On envoie le nouvel ID au client via le flux de données
              dataStream.writeData({ newChatId: newChatId });
              
              await db.insert(chats).values({
                id: newChatId,
                userId: userId,
                title: title,
              });
              chatId = newChatId;
            }

            // Save user and assistant messages
            await db.insert(_messages).values([
              {
                id: nanoid(),
                chatId,
                role: 'user',
                content: userMessage.content,
              },
              {
                id: nanoid(),
                chatId,
                role: 'assistant',
                content: text,
              },
            ]);

            // --- DÉBUT DE LA LOGIQUE D'INCRÉMENTATION ---
            if (userId !== adminUserId) {
              const subscription = await db.query.userSubscriptions.findFirst({
                where: eq(userSubscriptions.userId, userId),
              });

              if (!subscription) {
                // Créer une nouvelle entrée avec count = 1
                await db.insert(userSubscriptions).values({ 
                  id: nanoid(), 
                  userId: userId, 
                  messageCount: 1 
                });
              } else {
                // Incrémenter le compteur existant
                await db.update(userSubscriptions)
                  .set({ messageCount: sql`${userSubscriptions.messageCount} + 1` })
                  .where(eq(userSubscriptions.userId, userId));
              }
            }
            // --- FIN DE LA LOGIQUE D'INCRÉMENTATION ---
          },
        });

        // 🔥 Fusion du résultat dans le flux de données
        result.mergeIntoDataStream(dataStream);
      },
    });

  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 