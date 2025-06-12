"use client"

import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";

interface CodeBlockProps {
  language: string;
  value: string;
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative my-4 rounded-md border border-border overflow-hidden bg-card text-sm">
      {/* Header avec style Cyberpunk */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
        <span className="text-sm font-mono text-accent font-medium">{language}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCopy} 
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      
      {/* Code Highlighter avec FORCE BRUTE anti-débordement */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={isDark ? oneDark : oneLight}
          language={language}
          PreTag="div"
          customStyle={{ 
            margin: '0', 
            borderRadius: '0',
            padding: '1rem',
            backgroundColor: 'transparent',
            // CSS BRUTAL FORCE pour casser les mots longs
            wordBreak: 'break-all',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
} 