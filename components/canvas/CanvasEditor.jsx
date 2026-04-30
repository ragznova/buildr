"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const [selectedObject, setSelectedObject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerate = async (userPrompt) => {
    setIsGenModalOpen(false);
    setIsGenerating(true);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      
      const { html } = await res.json();
      
      // Save to localStorage
      localStorage.setItem("generatedHTML", html);
      
      // Go to preview
      router.push(`/dashboard/preview/${project?.id || 'new'}`);
    } catch (err) {
      console.error(err);
      alert("Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {isGenerating && (
        <div className="fixed inset-0 z-[500] bg-black/90 flex flex-col items-center justify-center">
           <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
           <h2 className="text-xl font-bold text-white uppercase">AI is Building your Site...</h2>
        </div>
      )}

      <Toolbar project={project} onSave={() => {}} isSaving={isSaving} />

      <div className="flex flex-grow overflow-hidden">
        <ToolPanel activeTool={activeTool} setActiveTool={setActiveTool} canvas={fabricRef.current} />
        
        <div className="flex-grow flex items-center justify-center p-12 bg-[#050505] relative">
           <canvas ref={canvasRef} className="rounded-xl shadow-2xl border border-white/5" />
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-full flex gap-3 shadow-2xl transition-all hover:scale-105">
                 <Sparkles />
                 <span className="font-black text-xl uppercase text-white">Generate Website</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={selectedObject} canvas={fabricRef.current} />
      </div>

      <GenerationModal 
        isOpen={isGenModalOpen} 
        onClose={() => setIsGenModalOpen(false)} 
        onGenerate={handleGenerate} 
      />
    </div>
  );
}
