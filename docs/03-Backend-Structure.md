# Backend Structure

## 1. Authentication
- **Provider:** Auth.js (NextAuth v5).
- **Strategy:** We will use the Drizzle ORM adapter for Auth.js.
- **OAuth Providers:** Initial support for Google and/or GitHub.

## 2. Database
- **Service:** Vercel Postgres.
- **ORM:** Drizzle ORM for type-safe database queries.
- **Schema (`src/lib/db/schema.ts`):**
  - `users`: Stores user profile information from Auth.js.
  - `chats`: Stores metadata for each conversation (e.g., `id`, `userId`, `title`, `createdAt`).
  - `messages`: Stores individual messages, linked to a `chatId` (e.g., `id`, `chatId`, `role: 'user' | 'assistant'`, `content`).

## 3. API Routes
- **Primary Endpoint:** `POST /api/chat`
  - Handles incoming user prompts.
  - Securely authenticates the request.
  - Calls the Groq API.
  - Streams the response back to the client.
  - Saves the user prompt and AI response to the database upon completion.

## 4. AI Integration
- **Service:** Groq API.
- **SDK:** Vercel AI SDK for simplifying the streaming logic on both client and server. 