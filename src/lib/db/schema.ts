import {
  timestamp,
  pgTable,
  text,
  serial,
} from "drizzle-orm/pg-core"

// Table pour stocker les conversations de chat
export const chats = pgTable("chat", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(), // L'ID utilisateur de Clerk
  title: text("title").notNull(),
  messages: text("messages").notNull(), // JSON stringifié des messages
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
})

// Table pour stocker les messages individuels si on veut une structure plus normalisée
export const messages = pgTable("message", {
  id: serial("id").primaryKey(),
  chatId: serial("chatId")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" ou "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
}) 