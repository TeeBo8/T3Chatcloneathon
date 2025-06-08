// Simple placeholder API route for testing useChat hook
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1]?.content || "Hello!";

    // Simple mock response
    const responseText = `This is a mock AI response. You said: "${lastMessage}"`;

    return new Response(responseText);
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Error processing request', { status: 500 });
  }
} 