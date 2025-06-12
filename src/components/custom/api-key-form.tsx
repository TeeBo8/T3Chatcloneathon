"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApiKeyFormProps {
  initialGroqApiKey: string | null;
  initialGeminiApiKey: string | null;
}

export function ApiKeyForm({ initialGroqApiKey, initialGeminiApiKey }: ApiKeyFormProps) {
  const [groqApiKey, setGroqApiKey] = useState(initialGroqApiKey || "");
  const [geminiApiKey, setGeminiApiKey] = useState(initialGeminiApiKey || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey, geminiApiKey }),
      });
      
      if (!response.ok) throw new Error("Failed to save keys.");
      
      toast.success("API keys saved successfully!");
      // Recharger la page pour mettre à jour les données côté serveur
      window.location.reload();
    } catch {
      toast.error("An error occurred while saving keys.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearKeys = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groqApiKey: "", geminiApiKey: "" }),
      });
      
      if (!response.ok) throw new Error("Failed to clear keys.");
      
      setGroqApiKey("");
      setGeminiApiKey("");
      toast.success("API keys cleared successfully!");
      // Recharger la page pour mettre à jour les données côté serveur
      window.location.reload();
    } catch {
      toast.error("An error occurred while clearing keys.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Bring Your Own Key (BYOK)
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Use your own API keys for more control. Keys are encrypted and stored securely.
                If no keys are provided, we&apos;ll use our default keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groq-key">Groq API Key</Label>
          <Input 
            id="groq-key" 
            type="password" 
            value={groqApiKey}
            onChange={(e) => setGroqApiKey(e.target.value)}
            placeholder="gsk_..."
          />
          <p className="text-xs text-muted-foreground">
            Get your key from{" "}
            <a 
              href="https://console.groq.com/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              console.groq.com
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemini-key">Gemini API Key</Label>
          <Input 
            id="gemini-key" 
            type="password" 
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="AIzaSy..."
          />
          <p className="text-xs text-muted-foreground">
            Get your key from{" "}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Keys"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearKeys}
            disabled={isLoading}
          >
            Clear Keys
          </Button>
        </div>
      </form>
    </div>
  );
} 