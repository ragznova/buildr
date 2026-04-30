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
import { Sparkles, Monitor, Smartphone, Loader2, Plus } from "lucide-react";
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
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 1. Define ALL Callbacks FIRST to prevent ReferenceErrors ---

  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      if (newHistory[newHistory.length - 1] === json) return prev;
      return [...newHistory, json];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const prevIndex = historyIndex - 1;
    const state = JSON.parse(history[prevIndex]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
      setHistoryIndex(prevIndex);
    });
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const nextIndex = historyIndex + 1;
    const state = JSON.parse(history[nextIndex]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
      setHistoryIndex(nextIndex);
    });
  }, [history, historyIndex]);

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
    const canvasWidth = fabricRef.current?.width || 1200;
    const canvasHeight = fabricRef.current?.height || 800;

    const describeLayout = () => {
      if (canvasObjects.length === 0) return "No wireframe provided. Generate a creative layout from scratch.";
      let description = "The user drew a wireframe with the following elements:\n";
      canvasObjects.forEach((obj) => {
        const isTop = obj.top < canvasHeight * 0.2;
        const isBottom = obj.top > canvasHeight * 0.8;
        const position = isTop ? "at the TOP" : isBottom ? "at the BOTTOM" : "in the MIDDLE";
        const type = obj.type === "rect" ? "Rectangle" : obj.type === "i-text" ? "Text" : "Shape";
        description += `- A ${type} ${position}. ${obj.text ? `Label: "${obj.text}"` : ""}\n`;
      });
      return description;
    };

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...data, 
          layoutDesc: describeLayout(),
          projectId: project.id
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.push(`/dashboard/preview/${project.id}`);
      } else {
        alert("Generation failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 2. Initialize Canvas Effect ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sidebarWidth = isSidebarCollapsed ? 80 : 256;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - sidebarWidth - 300,
      height: window.innerHeight - 64,
      backgroundColor: "#1A1A1A",
      preserveObjectStacking: true,
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
    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on("object:modified", () => saveHistory());
    canvas.on("object:added", (e) => {
      // Use a safer check for internal Fabric properties
      const isInternal = e.target && (e.target["_fromJSON"] || e.target["fromJSON"]);
      if (!isInternal) saveHistory();
    });

    const handleKeyDown = (e) => {
      const activeObject = canvas.getActiveObject();
      if (activeObject?.isEditing) return;
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
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, isSidebarCollapsed, saveHistory]);

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
    const timer = setInterval(saveCanvas, 30000);
    return () => clearInterval(timer);
  }, [saveCanvas]);

  // Zoom
  useEffect(() => {
    if (fabricRef.current) fabricRef.current.setZoom(zoom / 100);
  }, [zoom]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center">
             <div className="relative w-32 h-32 mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-blue-500 rounded-full" />
                <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={40} />
             </div>
             <h2 className="text-2xl font-black text-white uppercase">Analyzing Design</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <Toolbar project={project} onUndo={undo} onRedo={redo} onSave={saveCanvas} isSaving={isSaving} zoom={zoom} setZoom={setZoom} onOpenTemplates={() => setIsTemplatesOpen(true)} />
      
      <GenerationModal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} canvasData={fabricRef.current?.toJSON()} onGenerate={handleGenerate} />

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
        
        <div className="flex-grow flex items-center justify-center p-8 bg-black/40 relative">
           <canvas ref={canvasRef} className="rounded-sm" />
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-full flex gap-3 shadow-lg">
                 <Sparkles />
                 <span className="font-black text-lg uppercase text-white">Generate Website</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={selectedObject} canvas={fabricRef.current} />
      </div>

      <AnimatePresence>
        {isTemplatesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl bg-[#111111] border border-zinc-800 rounded-3xl p-8">
                <div className="flex justify-between mb-8">
                   <h2 className="text-xl font-bold text-white uppercase">Templates</h2>
                   <Button variant="ghost" onClick={() => setIsTemplatesOpen(false)}>Close</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[{ name: "Blank", json: "{}" }, { name: "Landing Page", json: '{"objects":[{"type":"rect","left":100,"top":100,"width":600,"height":400,"fill":"transparent","stroke":"#3B82F6","strokeWidth":2}]}' }].map((tpl) => (
                     <div key={tpl.name} onClick={() => loadTemplate(JSON.parse(tpl.json))} className="cursor-pointer group">
                        <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-blue-600">
                           <Plus className="text-zinc-600 group-hover:text-blue-500" />
                        </div>
                        <p className="text-center text-xs font-bold mt-2 text-zinc-500 group-hover:text-white uppercase">{tpl.name}</p>
                     </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
