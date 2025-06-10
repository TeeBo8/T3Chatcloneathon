"use client"

import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

const availableModels = [
  {
    id: "groq",
    name: "Groq (Llama 3)",
    description: "Fast and efficient for most conversations.",
    provider: "Groq",
    enabled: true,
    premium: false,
  },
  {
    id: "gemini",
    name: "Gemini (Pro 1.5)",
    description: "Google's flagship model, known for speed and accuracy.",
    provider: "Google",
    enabled: true,
    premium: false,
  },
];

export function ModelsSettings() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Available Models</h3>
        <p className="text-muted-foreground">
          Choose which AI models appear in your chat interface.
        </p>
      </div>

      <div className="space-y-4">
        {availableModels.map((model) => (
          <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={model.id} className="font-semibold">{model.name}</Label>
                <Badge variant="secondary" className="text-xs">
                  {model.provider}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{model.description}</p>
            </div>
            <Switch 
              id={model.id}
              defaultChecked={model.enabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Model preferences are saved automatically. 
          All models are currently available with message limits based on your plan.
        </p>
      </div>
    </div>
  );
} 