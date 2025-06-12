import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { groqApiKey, geminiApiKey } = await req.json();

    // Retrieve existing metadata to preserve other data
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingMetadata = user.privateMetadata || {};

    // Update only the API keys
    const updatedMetadata = {
      ...existingMetadata,
      groqApiKey: groqApiKey || undefined,
      geminiApiKey: geminiApiKey || undefined,
    };

    // If keys are empty, remove them completely
    if (!groqApiKey) {
      delete updatedMetadata.groqApiKey;
    }
    if (!geminiApiKey) {
      delete updatedMetadata.geminiApiKey;
    }

    await client.users.updateUser(userId, {
      privateMetadata: updatedMetadata,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'API keys updated successfully' 
    });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const groqApiKey = user.privateMetadata?.groqApiKey as string | undefined;
    const geminiApiKey = user.privateMetadata?.geminiApiKey as string | undefined;

    // Never return full keys to the client
    return NextResponse.json({
      hasGroqKey: !!groqApiKey,
      hasGeminiKey: !!geminiApiKey,
      groqKeyPreview: groqApiKey ? `${groqApiKey.substring(0, 8)}...` : null,
      geminiKeyPreview: geminiApiKey ? `${geminiApiKey.substring(0, 8)}...` : null,
    });
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 