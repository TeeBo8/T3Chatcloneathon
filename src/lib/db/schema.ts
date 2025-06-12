import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
} from "drizzle-orm/pg-core"

// Table pour stocker les conversations de chat
export const chats = pgTable("chats", {
  id: text("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(), // To store the Clerk user ID
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  
  // NOUVEAUX CHAMPS
  sharePath: text("share_path").unique(), // L'ID unique pour le lien de partage
})

// Table pour stocker les messages individuels si on veut une structure plus normalisée
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id").notNull().references(() => chats.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

// Table pour gérer les abonnements et limitations des utilisateurs
export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull().unique(), // L'ID de l'utilisateur Clerk
  messageCount: integer('message_count').notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // On pourra ajouter des champs pour Stripe plus tard ici : stripeCustomerId, plan, etc.
})