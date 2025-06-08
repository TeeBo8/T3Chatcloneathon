import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { auth } from '@clerk/nextjs/server'; // Import Clerk's auth
import { nanoid } from 'nanoid';

import { db } from '@/lib/db'; // Import our Drizzle instance
import { chats, messages as _messages } from '@/lib/db/schema'; // Import our schemas

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, chatId: currentChatId } = await req.json();
    const { userId } = await auth(); // Get the user ID from Clerk

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = messages[messages.length - 1];

    // Create a chat completion request to Groq with streaming
    const result = streamText({
      model: groq('llama3-8b-8192'), // Or 'mixtral-8x7b-32768'
      messages,
      onFinish: async ({ text: completion }) => {
        // This is where we save the conversation to the database
        const title = messages[0].content.substring(0, 100);
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

        // Save the user's message
        await db.insert(_messages).values({
          id: nanoid(),
          chatId: chatId,
          role: 'user',
          content: userMessage.content,
        });

        // Save the AI's response
        await db.insert(_messages).values({
          id: nanoid(),
          chatId: chatId,
          role: 'assistant',
          content: completion,
        });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response('An error occurred.', { status: 500 });
  }
} 