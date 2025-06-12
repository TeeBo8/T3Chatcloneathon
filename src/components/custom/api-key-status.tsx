"use client"

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Key } from "lucide-react";

interface ApiKeyStatus {
  hasGroqKey: boolean;
  hasGeminiKey: boolean;
  groqKeyPreview: string | null;
  geminiKeyPreview: string | null;
}

export function ApiKeyStatus() {
  const [status, setStatus] = useState<ApiKeyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/keys');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching API keys status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Groq API</span>
          <div className="flex items-center gap-2">
            {status.hasGroqKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-xs">
                  {status.groqKeyPreview}
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="outline" className="text-xs">
                  Default key
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Gemini API</span>
          <div className="flex items-center gap-2">
            {status.hasGeminiKey ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-xs">
                  {status.geminiKeyPreview}
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="outline" className="text-xs">
                  Default key
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {status.hasGroqKey || status.hasGeminiKey 
              ? "You&apos;re using your own API keys for full control."
              : "You&apos;re using our default keys. Add your own keys for more control."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 