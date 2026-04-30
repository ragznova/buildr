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

export default function CanvasEditor({ project }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const { isSidebarCollapsed } = useUIStore();
  
  const [activeTool, setActiveTool] = useState("select");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (typeof window === "undefined" || fabricRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - (isSidebarCollapsed ? 80 : 256) - 400,
      height: window.innerHeight - 150,
      backgroundColor: "#111111",
    });
    fabricRef.current = canvas;
    if (project?.canvasData) canvas.loadFromJSON(project.canvasData);
    
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [isSidebarCollapsed]);

  const handleGenerate = async (prompt) => {
    if (!prompt || !prompt.trim()) {
      alert("Please describe your website");
      return;
    }
    
    setIsGenModalOpen(false);
    setIsGenerating(true);
    setStatus("Generating your website...");
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("generatedHTML", data.html);
        router.push(`/dashboard/preview/${project?.id || "new"}`);
      } else {
        alert("Generation failed: " + data.error);
        setIsGenerating(false);
      }
    } catch (err) {
      alert("Error: " + err.message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {isGenerating && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex flex-col items-center justify-center">
           <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
           <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{status}</h2>
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
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-full flex gap-3 shadow-2xl transition-all hover:scale-105 active:scale-95">
                 <Sparkles />
                 <span className="font-black text-xl uppercase text-white">Generate Website</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={null} canvas={fabricRef.current} />
      </div>

      <GenerationModal 
        isOpen={isGenModalOpen} 
        onClose={() => setIsGenModalOpen(false)} 
        onGenerate={handleGenerate} 
      />
    </div>
  );
}
