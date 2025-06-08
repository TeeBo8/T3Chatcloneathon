import {
  timestamp,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

// Table pour stocker les conversations de chat
export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(), // To store the Clerk user ID
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Table pour stocker les messages individuels si on veut une structure plus normalisée
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}) 