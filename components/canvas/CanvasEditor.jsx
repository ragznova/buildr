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

  // History State using Refs to avoid Infinite Loops
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // --- 1. History Management ---
  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    
    // Check if duplicate
    const currentHistory = historyRef.current;
    const currentIndex = historyIndexRef.current;
    
    if (currentHistory[currentIndex] === json) return;

    // Add to history
    const newHistory = currentHistory.slice(0, currentIndex + 1);
    historyRef.current = [...newHistory, json];
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0 || !fabricRef.current) return;
    historyIndexRef.current -= 1;
    const state = JSON.parse(historyRef.current[historyIndexRef.current]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
    });
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1 || !fabricRef.current) return;
    historyIndexRef.current += 1;
    const state = JSON.parse(historyRef.current[historyIndexRef.current]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
    });
  }, []);

  // --- 2. Canvas Operations ---
  const saveCanvas = useCallback(async () => {
    if (!fabricRef.current || !project?.id || !db) return;
    setIsSaving(true);
    try {
      const json = fabricRef.current.toJSON();
      await updateDoc(doc(db, "projects", project.id), {
        canvasData: json,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setIsSaving(false);
    }
  }, [project?.id]);

  const loadTemplate = useCallback((templateJson) => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = "#1A1A1A";
    fabricRef.current.loadFromJSON(templateJson).then(() => {
      fabricRef.current.renderAll();
      saveHistory();
      setIsTemplatesOpen(false);
    });
  }, [saveHistory]);

  const handleGenerate = async (data) => {
    setIsGenModalOpen(false);
    setIsGenerating(true);
    
    const canvasObjects = fabricRef.current?.toJSON().objects || [];
    const layoutDesc = canvasObjects.length === 0 ? "Generate from scratch" : "User wireframe description...";

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...data, 
          layoutDesc,
          projectId: project.id
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.push(`/dashboard/preview/${project.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 3. Initial Setup (RUNS ONCE) ---
  useEffect(() => {
    if (typeof window === "undefined" || fabricRef.current) return;

    const sidebarWidth = isSidebarCollapsed ? 80 : 256;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - sidebarWidth - 300,
      height: window.innerHeight - 64,
      backgroundColor: "#1A1A1A",
    });

    fabricRef.current = canvas;

    if (project?.canvasData) {
      canvas.loadFromJSON(project.canvasData, () => {
        canvas.renderAll();
        saveHistory();
      });
    } else {
      saveHistory();
    }

    // Events
    canvas.on("object:modified", () => saveHistory());
    canvas.on("object:added", (e) => {
      if (!e.target._fromJSON) saveHistory();
    });
    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        canvas.remove(...canvas.getActiveObjects());
        canvas.discardActiveObject();
        canvas.renderAll();
        saveHistory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      canvas.dispose();
      fabricRef.current = null;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project?.id, isSidebarCollapsed, saveHistory]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (fabricRef.current) {
        const sidebarWidth = isSidebarCollapsed ? 80 : 256;
        fabricRef.current.setDimensions({
          width: Math.max(800, window.innerWidth - sidebarWidth - 340),
          height: Math.max(600, window.innerHeight - 100)
        });
        fabricRef.current.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarCollapsed]);

  // Auto-save
  useEffect(() => {
    const timer = setInterval(saveCanvas, 60000); // Save every minute
    return () => clearInterval(timer);
  }, [saveCanvas]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      <AnimatePresence>
        {isGenerating && (
          <div className="absolute inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center">
             <Sparkles className="text-blue-500 animate-pulse mb-4" size={48} />
             <h2 className="text-xl font-bold text-white uppercase tracking-tighter">AI Neural Bridge Online</h2>
          </div>
        )}
      </AnimatePresence>

      <Toolbar project={project} onUndo={undo} onRedo={redo} onSave={saveCanvas} isSaving={isSaving} zoom={zoom} setZoom={setZoom} onOpenTemplates={() => setIsTemplatesOpen(true)} />
      
      <GenerationModal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} onGenerate={handleGenerate} />

      <div className="flex flex-grow overflow-hidden relative">
        <ToolPanel activeTool={activeTool} setActiveTool={(tool) => {
          setActiveTool(tool);
          if (fabricRef.current) {
            const canvas = fabricRef.current;
            canvas.isDrawingMode = tool === "draw";
            if (tool === "draw") {
              canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
              canvas.freeDrawingBrush.width = 4;
              canvas.freeDrawingBrush.color = "#3B82F6";
            }
            canvas.renderAll();
          }
        }} canvas={fabricRef.current} />
        
        <div className="flex-grow flex items-center justify-center p-8 bg-black/40 relative overflow-hidden">
           <canvas ref={canvasRef} className="rounded-sm shadow-2xl" />
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-full flex gap-3 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                 <Sparkles />
                 <span className="font-black text-lg uppercase text-white">Generate Website</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={selectedObject} canvas={fabricRef.current} />
      </div>

      <AnimatePresence>
        {isTemplatesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
             <div className="w-full max-w-2xl bg-[#111111] border border-zinc-800 rounded-3xl p-8">
                <div className="flex justify-between mb-8">
                   <h2 className="text-xl font-bold text-white uppercase">Wireframe Templates</h2>
                   <Button variant="ghost" onClick={() => setIsTemplatesOpen(false)}>Close</Button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   {[{ name: "Landing Page", json: '{"objects":[{"type":"rect","left":100,"top":100,"width":600,"height":400,"fill":"transparent","stroke":"#3B82F6","strokeWidth":2}]}' }].map((tpl) => (
                     <div key={tpl.name} onClick={() => loadTemplate(JSON.parse(tpl.json))} className="cursor-pointer group bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-blue-600">
                        <Plus className="text-zinc-600 group-hover:text-blue-500 mb-2" />
                        <p className="text-xs font-bold text-zinc-500 group-hover:text-white uppercase">{tpl.name}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
