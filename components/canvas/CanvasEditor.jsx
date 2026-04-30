"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import ToolPanel from "./ToolPanel";
import PropertiesPanel from "./PropertiesPanel";
import Toolbar from "./Toolbar";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import GenerationModal from "./GenerationModal";
import { useUIStore } from "@/store/useUIStore";

export default function CanvasEditor({ project }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const { isSidebarCollapsed } = useUIStore();
  
  // State
  const [activeTool, setActiveTool] = useState("select");
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 1. Tools & History ---
  const saveHistory = useCallback(() => {
    // History logic simplified for speed
    if (fabricRef.current) fabricRef.current.renderAll();
  }, []);

  const changeTool = useCallback((tool) => {
    setActiveTool(tool);
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = tool === "draw";
    if (tool === "draw") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 4;
      canvas.freeDrawingBrush.color = "#3B82F6";
    }
    canvas.renderAll();
  }, []);

  // --- 2. Canvas Lifecycle ---
  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current || fabricRef.current) return;

    const sidebarWidth = isSidebarCollapsed ? 80 : 256;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - sidebarWidth - 400,
      height: window.innerHeight - 150,
      backgroundColor: "#111111",
    });

    fabricRef.current = canvas;

    if (project?.canvasData) {
      canvas.loadFromJSON(project.canvasData, () => canvas.renderAll());
    }

    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [project?.id, isSidebarCollapsed]);

  // --- 3. Generation Logic ---
  const handleGenerate = async (data) => {
    if (!project?.id) return;
    setIsGenModalOpen(false);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: data.prompt, 
          projectId: project.id 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // AI returned HTML and server saved it to Firebase
        router.push(`/dashboard/preview/${project.id}`);
      } else {
        alert("Generation Error: " + (result.error || "Unknown"));
        setIsGenerating(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
      setIsGenerating(false);
    }
  };

  const saveCanvas = useCallback(async () => {
    if (!fabricRef.current || !project?.id || !db) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "projects", project.id), {
        canvasData: fabricRef.current.toJSON(),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [project?.id]);

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* NO SYNCING SCREEN - DIRECT LOAD */}
      
      {/* Simple Generation Spinner */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 z-[500] bg-black/95 flex flex-col items-center justify-center">
             <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
             <h2 className="text-xl font-bold text-white uppercase">Neural Engine Generating...</h2>
          </div>
        )}
      </AnimatePresence>

      <Toolbar project={project} onUndo={() => {}} onRedo={() => {}} onSave={saveCanvas} isSaving={isSaving} zoom={zoom} setZoom={setZoom} onOpenTemplates={() => setIsTemplatesOpen(true)} />

      <div className="flex flex-grow overflow-hidden">
        <ToolPanel activeTool={activeTool} setActiveTool={changeTool} canvas={fabricRef.current} />
        
        <div className="flex-grow flex items-center justify-center p-12 bg-[#050505] relative">
           <div className="bg-[#111111] p-1 rounded-xl shadow-2xl border border-white/5">
              <canvas ref={canvasRef} />
           </div>
           
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-full flex gap-3 shadow-2xl">
                 <Sparkles />
                 <span className="font-black text-xl uppercase text-white">Generate Website</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={selectedObject} canvas={fabricRef.current} />
      </div>

      <GenerationModal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} onGenerate={handleGenerate} />
    </div>
  );
}
