import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { userSubscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Récupérer l'abonnement de l'utilisateur
    const subscription = await db.query.userSubscriptions.findFirst({
      where: eq(userSubscriptions.userId, userId),
    });

    const messageCount = subscription?.messageCount || 0;
    const messageLimit = 20;
    const messagesRemaining = messageLimit - messageCount;

    return new Response(JSON.stringify({
      messageCount,
      messageLimit,
      messagesRemaining,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in /api/user/subscription:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 