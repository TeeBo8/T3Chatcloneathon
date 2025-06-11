import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Endpoint pour éditer un message (PUT)
export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messageId, newContent } = await req.json();

    // TODO: Ajouter une vérification de sécurité pour s'assurer
    // que l'utilisateur est bien le propriétaire du chat auquel ce message appartient.

    await db
      .update(messages)
      .set({ content: newContent })
      .where(eq(messages.id, messageId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ success: false, error: "Failed to update message" }, { status: 500 });
  }
}

// Endpoint pour supprimer un message (DELETE)
export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { messageId } = await req.json();
    
    // TODO: Ajouter vérification de sécurité

    await db.delete(messages).where(eq(messages.id, messageId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 });
  }
} 