import { ChatWindow } from '@/components/custom/chat-window';
import { type Message } from 'ai';

export default async function HomePage() {
  // La page principale est toujours une nouvelle conversation,
  // donc initialMessages reste vide.
  const initialMessages: Message[] = [];
  
  return (
    <ChatWindow 
      chatId="" 
      initialMessages={initialMessages} 
    />
  );
} 