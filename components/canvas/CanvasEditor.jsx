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
import { Sparkles, Loader2, Plus, MousePointer2 } from "lucide-react";
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

  // History Refs
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // --- 1. Tool Logic ---
  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    if (historyRef.current[historyIndexRef.current] === json) return;
    
    historyRef.current = [...historyRef.current.slice(0, historyIndexRef.current + 1), json];
    historyIndexRef.current = historyRef.current.length - 1;
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
    canvas.discardActiveObject();
    canvas.renderAll();
  }, []);

  // --- 2. Canvas Setup ---
  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;
    if (fabricRef.current) return; // Prevent double init

    const sidebarWidth = isSidebarCollapsed ? 80 : 256;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - sidebarWidth - 400,
      height: window.innerHeight - 150,
      backgroundColor: "#111111",
      selection: true,
      preserveObjectStacking: true
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

    // Event Bindings
    canvas.on("object:modified", saveHistory);
    canvas.on("object:added", (e) => {
      if (!e.target._fromJSON) saveHistory();
    });
    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [project?.id, isSidebarCollapsed, saveHistory]);

  // --- 3. Save Logic ---
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

  const handleGenerate = async (data) => {
    setIsGenModalOpen(false);
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId: project.id }),
      });
      const result = await response.json();
      if (result.success) router.push(`/dashboard/preview/${project.id}`);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Loading Overlay - ONLY shows when Generating */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black/90 flex flex-col items-center justify-center">
             <div className="p-8 border border-blue-500/20 rounded-3xl bg-blue-500/5 backdrop-blur-xl flex flex-col items-center">
                <Loader2 className="text-blue-500 animate-spin mb-4" size={40} />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Engine Synchronizing...</h2>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toolbar project={project} onUndo={() => {}} onRedo={() => {}} onSave={saveCanvas} isSaving={isSaving} zoom={zoom} setZoom={setZoom} onOpenTemplates={() => setIsTemplatesOpen(true)} />

      <div className="flex flex-grow overflow-hidden">
        <ToolPanel activeTool={activeTool} setActiveTool={changeTool} canvas={fabricRef.current} />
        
        <div className="flex-grow flex items-center justify-center p-12 bg-[#050505] relative overflow-hidden">
           <div className="bg-[#111111] p-1 rounded-xl shadow-[0_0_80px_rgba(0,0,0,1)] border border-white/5">
              <canvas ref={canvasRef} />
           </div>
           
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <Button onClick={() => setIsGenModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-16 px-10 rounded-full flex gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                 <Sparkles size={24} />
                 <span className="font-black text-xl uppercase text-white">Generate Site</span>
              </Button>
           </div>
        </div>

        <PropertiesPanel selectedObject={selectedObject} canvas={fabricRef.current} />
      </div>

      <GenerationModal isOpen={isGenModalOpen} onClose={() => setIsGenModalOpen(false)} onGenerate={handleGenerate} />
    </div>
  );
}
