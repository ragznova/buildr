"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import ToolPanel from "./ToolPanel";
import PropertiesPanel from "./PropertiesPanel";
import Toolbar from "./Toolbar";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GenerationModal from "./GenerationModal";
import { useUIStore } from "@/store/useUIStore";

function describeCanvas(canvas) {
  if (!canvas) return "";
  const objects = canvas.getObjects();
  if (objects.length === 0) return "";
  
  const h = canvas.height;
  const parts = [];
  objects.forEach((obj) => {
    const yPos = obj.top / h;
    const pos = yPos < 0.2 ? "top (header/navbar area)" : yPos > 0.75 ? "bottom (footer area)" : "middle (main content area)";
    const type = obj.type === "rect" ? "Rectangle" : obj.type === "circle" ? "Circle" : obj.type === "i-text" ? "Text" : "Shape";
    parts.push(`${type} at ${pos}${obj.text ? ': "' + obj.text + '"' : ""}`);
  });
  return "User's wireframe layout: " + parts.join(", ") + ".";
}

export default function CanvasEditor({ project }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const { isSidebarCollapsed } = useUIStore();
  
  const [activeTool, setActiveTool] = useState("select");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || fabricRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - (isSidebarCollapsed ? 80 : 256) - 400,
      height: window.innerHeight - 150,
      backgroundColor: "#111111",
    });
    fabricRef.current = canvas;
    if (project?.canvasData) canvas.loadFromJSON(project.canvasData);
    return () => { if (fabricRef.current) { fabricRef.current.dispose(); fabricRef.current = null; } };
  }, [isSidebarCollapsed]);

  const handleGenerate = async (userPrompt) => {
    if (!userPrompt?.trim()) { alert("Please describe your website"); return; }
    
    setIsGenModalOpen(false);
    setIsGenerating(true);
    setStatus("AI is designing your website...");

    const layoutDesc = describeCanvas(fabricRef.current);
    const fullPrompt = layoutDesc ? `${userPrompt}. ${layoutDesc}` : userPrompt;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();

      if (data.success && data.html) {
        localStorage.setItem("generatedHTML", data.html);
        router.push(`/dashboard/preview/${project?.id || "new"}`);
      } else {
        alert("Generation failed: " + (data.error || "Unknown error"));
        setIsGenerating(false);
      }
    } catch (err) {
      alert("Network error: " + err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {isGenerating && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-20 h-20 border-2 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{status}</h2>
          <p className="text-zinc-500 text-sm">This usually takes 5-10 seconds</p>
        </div>
      )}

      <Toolbar project={project} onSave={() => {}} />

      <div className="flex flex-grow overflow-hidden">
        <ToolPanel activeTool={activeTool} setActiveTool={setActiveTool} canvas={fabricRef.current} />
        
        <div className="flex-grow flex items-center justify-center p-12 bg-[#050505] relative">
          <div className="bg-[#111111] p-1 rounded-xl shadow-2xl border border-white/5">
            <canvas ref={canvasRef} />
          </div>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-full flex gap-3 shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95">
              <Sparkles />
              <span className="font-black text-xl uppercase text-white">Generate Website</span>
            </Button>
          </div>
        </div>

        <PropertiesPanel selectedObject={null} canvas={fabricRef.current} />
      </div>

      <GenerationModal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} onGenerate={handleGenerate} />
    </div>
  );
}
