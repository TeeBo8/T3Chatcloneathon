"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Model = "deepseek-free" | "gemini-2.0" | "groq" | "gemini-1.5";

interface ModelSelectorProps {
  model: Model;
  onModelChange: (model: Model) => void;
}

export function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
  return (
    <Select value={model} onValueChange={(value) => onModelChange(value as Model)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="deepseek-free">🆓 DeepSeek Chat</SelectItem>
        <SelectItem value="gemini-2.0">⚡ Gemini 2.0 Flash</SelectItem>
        <SelectItem value="groq">🚀 Groq (Llama 3)</SelectItem>
        <SelectItem value="gemini-1.5">🔶 Gemini 1.5 Pro</SelectItem>
      </SelectContent>
    </Select>
  );
} 