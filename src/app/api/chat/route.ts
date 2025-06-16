import { streamText, createDataStreamResponse } from 'ai';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { chats, messages as _messages, userSubscriptions } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

// Import and initialize model providers
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

// System prompt for NPC Identity Shaper
const NPC_IDENTITY_PROMPT = `You are a clandestine "Ripperdoc" of identities, an underground artist operating in the shadows of Night City. Your craft isn't surgery - it's sculpting unforgettable Non-Player Characters (NPCs) that breathe life into stories. Your response MUST follow this dossier structure using Markdown:

**// NPC DOSSIER //**

**🏷️ Name & Handle:** [A name that hits hard and a street name that tells a story. Examples: "Marcus 'Ghost-Wire' Chen", "Valentina 'RedTrace' Kozlov"]

**👁️ Appearance:** [Describe their look in 2-3 sharp sentences. Focus on one distinctive cybernetic enhancement or clothing style that makes them unforgettable.]

**🎭 Mannerism / Speech Pattern:** [A habit, recurring phrase, or gesture that makes them come alive. Something that players will remember and quote. Examples: "Always taps their chrome fingers when thinking", "Ends every sentence with 'capisce?'", "Never makes eye contact due to faulty optic implants"]

**🔥 Core Motivation:** [Their driving force. What gets them out of bed in this hellscape? Examples: "Avenge their murdered partner", "Become a Net-running legend", "Just survive one more day in the combat zone"]

**🔒 Dark Secret:** [Their Achilles' heel, the skeleton in their closet. The perfect plot hook. Examples: "Secretly feeds intel to a rival corpo", "Their military-grade arm implant is a counterfeit about to catastrophically fail", "Owes massive debt to the Tyger Claws and time is running out"]

**💡 Plot Hook Potential:** [One sentence suggesting how this NPC could become involved in the players' story - as ally, enemy, or wild card]

Stay creative, concise, and deeply rooted in authentic Cyberpunk lore and atmosphere. Make every NPC feel like they could step directly into Night City and belong there.

---

Craft a new identity now:`;

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();
    const { chatId: currentChatId, model: modelProvider } = data;
    const { userId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({
        status: 401,
        message: 'Please sign in to continue the conversation.',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Retrieve user API keys (BYOK)
    let userGroqKey: string | undefined;
    let userGeminiKey: string | undefined;

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      userGroqKey = user.privateMetadata?.groqApiKey as string | undefined;
      userGeminiKey = user.privateMetadata?.geminiApiKey as string | undefined;
    } catch (error) {
      console.warn("Unable to retrieve user keys, using default keys:", error);
    }

    // Initialiser les providers AVEC la clé de l'utilisateur si elle existe
    const google = createGoogleGenerativeAI({
      apiKey: userGeminiKey || process.env.GEMINI_API_KEY,
    });
    
    const groq = createGroq({
      apiKey: userGroqKey || process.env.GROQ_API_KEY,
    });

    // OpenRouter for free premium models
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });

    // Rate limiting (except for admin)
    const adminUserId = process.env.ADMIN_USER_ID;
    const MESSAGE_LIMIT = 20;

    if (userId !== adminUserId) {
      const subscription = await db.query.userSubscriptions.findFirst({
        where: eq(userSubscriptions.userId, userId),
      });

      if (subscription && subscription.messageCount >= MESSAGE_LIMIT) {
        return new Response('Message limit exceeded. Please upgrade your plan.', { status: 429 });
      }
    }

    const userMessage = messages[messages.length - 1];
    
    // Smart prompt detection and system prompt injection
    let finalMessages = [...messages]; // Copy of messages for potential modification
    if (userMessage.content.toLowerCase().startsWith('generate an npc:')) {
      finalMessages = [{ role: 'system', content: NPC_IDENTITY_PROMPT }, ...messages];
    }
    
    // API key validation
    const effectiveGeminiKey = userGeminiKey || process.env.GEMINI_API_KEY;
    const effectiveGroqKey = userGroqKey || process.env.GROQ_API_KEY;
    
    if ((modelProvider === 'gemini-2.0' || modelProvider === 'gemini-1.5') && !effectiveGeminiKey) {
      return new Response('Gemini API key not configured. Please add your own API key in Settings.', { status: 500 });
    }
    
    if (modelProvider === 'groq' && !effectiveGroqKey) {
      return new Response('Groq API key not configured. Please add your own API key in Settings.', { status: 500 });
    }

    if (modelProvider === 'deepseek-free' && !process.env.OPENROUTER_API_KEY) {
      return new Response('OpenRouter API key not configured.', { status: 500 });
    }
    
    // Model selection
    let model;
    switch (modelProvider) {
      case 'deepseek-free':
        model = openrouter('deepseek/deepseek-chat-v3-0324:free');
        break;
      case 'gemini-2.0':
        model = google('models/gemini-2.0-flash');
        break;
      case 'gemini-1.5':
        model = google('models/gemini-1.5-flash');
        break;
      case 'groq':
      default:
        model = groq('llama3-8b-8192');
        break;
    }

    return createDataStreamResponse({
      execute: dataStream => {
        const result = streamText({
          model: model,
          messages: finalMessages,
          maxTokens: 4096,
          onFinish: async ({ text }) => {
            // Save conversation to database
            const title = messages.length > 0 ? messages[0].content.substring(0, 50) : 'New Chat';
            let chatId = currentChatId;

            // Create chat entry for new conversations
            if (!chatId) {
              const newChatId = nanoid();
              dataStream.writeData({ newChatId: newChatId });
              
              await db.insert(chats).values({
                id: newChatId,
                userId: userId,
                title: title,
              });
              chatId = newChatId;
            }

            // Save messages SÉPARÉMENT pour garantir l'ordre chronologique
            // 1. D'abord le message utilisateur
            await db.insert(_messages).values({
              id: nanoid(),
              chatId,
              role: 'user',
              content: userMessage.content,
            });

            // 2. Ensuite le message IA (avec un délai infime pour garantir l'ordre)
            await new Promise(resolve => setTimeout(resolve, 1));
            await db.insert(_messages).values({
              id: nanoid(),
              chatId,
              role: 'assistant',
              content: text,
            });

            // Update usage counter (except for admin)
            if (userId !== adminUserId) {
              const subscription = await db.query.userSubscriptions.findFirst({
                where: eq(userSubscriptions.userId, userId),
              });

              if (!subscription) {
                await db.insert(userSubscriptions).values({ 
                  id: nanoid(), 
                  userId: userId, 
                  messageCount: 1 
                });
              } else {
                await db.update(userSubscriptions)
                  .set({ messageCount: sql`${userSubscriptions.messageCount} + 1` })
                  .where(eq(userSubscriptions.userId, userId));
              }
            }
          },
        });

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