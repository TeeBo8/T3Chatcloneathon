"use client"
import Link from "next/link";
import { Button } from "../ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DeleteChatButton } from "./delete-chat-button";

// On définit le type de nos chats
type Chat = {
  id: string;
  title: string;
  sharePath: string | null;
};

interface ChatHistoryListProps {
  userChats: Chat[];
}

export function ChatHistoryList({ userChats }: ChatHistoryListProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldReloadOnClose, setShouldReloadOnClose] = useState(false);

  const handleShareClick = async (chatId: string, sharePath: string | null) => {
    setIsLoading(true);
    let fullUrl = "";

    if (sharePath) {
      // Si déjà partagé, on utilise le lien existant
      fullUrl = `${window.location.origin}/s/${sharePath}`;
    } else {
      // Si pas encore partagé, on appelle notre API
      try {
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId }),
        });
        
        if (response.ok) {
          const { sharePath: newSharePath } = await response.json();
          fullUrl = `${window.location.origin}/s/${newSharePath}`;
          // On marquera qu'il faut reloader quand la modale se ferme
          setShouldReloadOnClose(true);
        } else {
          throw new Error("Failed to share chat.");
        }
              } catch {
          toast.error("Failed to share chat.");
          setIsLoading(false);
          return;
        }
    }

    setShareLink(fullUrl);
    setShareDialogOpen(true);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDialogClose = (open: boolean) => {
    setShareDialogOpen(open);
    // Si la modale se ferme et qu'on doit reloader
    if (!open && shouldReloadOnClose) {
      setShouldReloadOnClose(false);
      window.location.reload();
    }
  };

  return (
    <>
      <div className="flex-1 flex-col-reverse overflow-y-auto space-y-1">
        {userChats.map((chat) => (
          <div key={chat.id} className="group relative flex items-center">
            <Link href={`/chat/${chat.id}`} className="flex-1 truncate p-2 pr-16 rounded-md hover:bg-primary/10 transition-colors">
              {chat.title}
            </Link>
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 bg-gradient-to-l from-background via-background/80 to-transparent group-hover:from-background/90">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 mr-1"
                onClick={() => handleShareClick(chat.id, chat.sharePath)}
                disabled={isLoading}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <DeleteChatButton chatId={chat.id} />
            </div>
          </div>
        ))}
      </div>

      {/* MODALE DE PARTAGE */}
      <Dialog open={shareDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Conversation</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={shareLink} readOnly />
            <Button onClick={handleCopy} size="icon">
              {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 