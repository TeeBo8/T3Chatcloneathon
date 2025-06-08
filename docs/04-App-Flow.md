# Application Flow

## 1. New User / Login Flow
1. User lands on the homepage (`/`).
2. If not authenticated, the main view prompts them to "Login to start chatting".
3. User clicks "Login".
4. User is redirected to the Auth.js sign-in page (`/api/auth/signin`).
5. User selects an OAuth provider (e.g., Google).
6. After successful authentication, user is redirected back to the main chat page (`/chat`).

## 2. Starting a New Chat
1. Authenticated user is on a chat page (e.g., `/chat` or `/chat/[chatId]`).
2. User clicks the "New Chat" button in the sidebar.
3. The application navigates to `/chat`.
4. The main chat area is cleared, ready for a new prompt.
5. The chat history in the sidebar is updated to show the new, untitled chat once the first message is sent.

## 3. Chatting Flow
1. User types a message in the input field.
2. User presses "Enter" or clicks the "Send" button.
3. The input is disabled, and the user's message appears in the chat log.
4. A POST request is sent to `/api/chat`.
5. A loading/skeleton state appears for the AI's response.
6. The UI begins rendering the AI's response token-by-token as it streams from the server.
7. Once the stream is complete, the chat is persisted to the database. 