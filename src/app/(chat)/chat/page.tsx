import { ChatWindow } from "@/components/custom/chat-window";

export default function NewChatPage() {
  // On passe un chatId vide et un tableau de messages vide
  // pour que ChatWindow sache qu'il doit afficher l'état initial.
  return (
    <ChatWindow 
      chatId="" 
      initialMessages={[]} 
    />
  );
} 