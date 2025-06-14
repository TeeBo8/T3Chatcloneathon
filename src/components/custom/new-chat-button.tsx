"use client"

import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewChatButton() {
  const router = useRouter();

  const handleNewChat = () => {
    // Redirection vers la racine où se trouve maintenant le chat principal
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant="outline" className="w-full mb-4" onClick={handleNewChat}>
      <MessageSquare className="mr-2 h-4 w-4" />
      New Chat
    </Button>
  );
} 