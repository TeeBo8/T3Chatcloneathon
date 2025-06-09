"use server"

import { auth } from "@clerk/nextjs/server"
import { db } from "../lib/db"
import { chats } from "../lib/db/schema"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function deleteChat(chatId: string) {
  const { userId } = await auth()
  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    // Double-check ownership before deleting
    await db
      .delete(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))

    // Revalidate the chat layout to refresh the history list
    revalidatePath("/(chat)", "layout");
    revalidatePath("/chat");
    
    return { success: true }
  } catch (error) {
    console.error("Database error:", error)
    return { error: "Failed to delete chat" }
  }
} 