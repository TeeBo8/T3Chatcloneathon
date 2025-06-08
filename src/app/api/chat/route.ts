import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Create a chat completion request to Groq with streaming
    const result = streamText({
      model: groq('llama3-8b-8192'), // Or 'mixtral-8x7b-32768'
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return new Response('An error occurred.', { status: 500 });
  }
} 