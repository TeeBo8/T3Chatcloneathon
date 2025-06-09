import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { chats, messages as _messages } from '@/lib/db/schema';

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
    const { messages, data } = await req.json(); // <-- On lit 'data'
    const { chatId: currentChatId, model: modelProvider } = data; // <-- On extrait les infos de 'data'
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

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
    const result = await streamText({
      model: model,
      messages: messages,
      onFinish: async ({ text }) => {
        // This is where we save the conversation to the database
        const title = messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Chat';
        let chatId = currentChatId;

        // If it's a new chat, create a chat entry first
        if (!chatId) {
          const newChatId = nanoid();
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
      },
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error in /api/chat:', error);
    // Ensure you return a Response object
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 