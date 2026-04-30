"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GenerationModal({ isOpen, onClose, onGenerate }) {
  const [prompt, setPrompt] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-3xl p-8 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
            <Sparkles />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Site Builder</h2>
        </div>

        <p className="text-zinc-400 mb-6 text-sm">
          Describe your dream website below. Our AI will build the entire structure, content, and styling in seconds.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A modern dark coffee shop website with a menu, contact form and gallery..."
          className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-700 focus:border-blue-600 focus:outline-none transition-all resize-none mb-6"
        />

        <Button
          onClick={() => onGenerate(prompt)}
          disabled={!prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-bold text-lg"
        >
          Generate Website
        </Button>
      </div>
    </div>
  );
}
