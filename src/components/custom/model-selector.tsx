"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Model = "groq" | "gemini";

interface ModelSelectorProps {
  model: Model;
  onModelChange: (model: Model) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <Select value={model} onValueChange={(value) => onModelChange(value as Model)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="groq">Groq (Llama 3)</SelectItem>
        <SelectItem value="gemini">Gemini (Pro 1.5)</SelectItem>
      </SelectContent>
    </Select>
  );
} 