import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b bg-background">
        <div className="max-w-6xl mx-auto">
          <Link href="/chat">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
} 