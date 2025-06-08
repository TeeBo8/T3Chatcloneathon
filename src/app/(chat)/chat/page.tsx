import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Another placeholder component for the chat area
const ChatInterface = () => {
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex-1">
        {/* Chat messages will go here */}
        <p className="text-center text-gray-500">
          Start a new conversation
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Input placeholder="Type your message here..." />
        <Button>Send</Button>
      </div>
    </div>
  );
};

export default function ChatPage() {
  return <ChatInterface />;
} 