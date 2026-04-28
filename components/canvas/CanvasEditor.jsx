"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import ToolPanel from "./ToolPanel";
import PropertiesPanel from "./PropertiesPanel";
import Toolbar from "./Toolbar";
import { firestore as db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Monitor, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CanvasEditor({ project }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const [activeTool, setActiveTool] = useState("select");
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize Canvas
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - 560, // Tool + Properties panels
      height: window.innerHeight - 64, // Toolbar
      backgroundColor: "#1A1A1A",
      preserveObjectStacking: true,
      stopContextMenu: true,
    });

    fabricRef.current = canvas;

    // Load project data if exists
    if (project?.canvasData) {
      canvas.loadFromJSON(project.canvasData, () => {
        canvas.renderAll();
        saveHistory();
      });
    } else {
      saveHistory();
    }

    // Event Listeners
    canvas.on("selection:created", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:updated", (e) => setSelectedObject(e.selected[0]));
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on("object:modified", () => saveHistory());
    canvas.on("object:added", () => saveHistory());

    // Shortcuts
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        canvas.remove(...activeObjects);
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.dispose();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project]);

  // History Management
  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(history[prevIndex], () => {
      fabricRef.current.renderAll();
      setHistoryIndex(prevIndex);
    });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(history[nextIndex], () => {
      fabricRef.current.renderAll();
      setHistoryIndex(nextIndex);
    });
  };

  // Save to Firebase
  const saveCanvas = async () => {
    if (!fabricRef.current || !project?.id) return;
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
  };

  // Auto-save
  useEffect(() => {
    const timer = setInterval(saveCanvas, 30000);
    return () => clearInterval(timer);
  }, [project?.id]);

  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadTemplate = (templateJson) => {
    if (!fabricRef.current) return;
    fabricRef.current.loadFromJSON(templateJson, () => {
      fabricRef.current.renderAll();
      saveHistory();
      setIsTemplatesOpen(false);
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulation of AI processing
    setTimeout(() => {
       setIsGenerating(false);
       // In next milestone, redirect to preview/code
       alert("AI is analyzing your sketch... Redirecting to generation engine.");
    }, 3000);
  };

  // Zoom implementation
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(zoom / 100);
  }, [zoom]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      <Toolbar 
        project={project} 
        onUndo={undo} 
        onRedo={redo} 
        onSave={saveCanvas} 
        isSaving={isSaving} 
        zoom={zoom}
        setZoom={setZoom}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />
      
      <div className="flex flex-grow overflow-hidden relative">
        <ToolPanel 
          activeTool={activeTool} 
          setActiveTool={(tool) => {
            setActiveTool(tool);
            if (fabricRef.current) {
              const canvas = fabricRef.current;
              canvas.isDrawingMode = tool === "draw";
              
              if (tool === "draw") {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.width = 4;
                canvas.freeDrawingBrush.color = "#3B82F6";
                canvas.defaultCursor = "crosshair";
              } else {
                canvas.defaultCursor = "default";
              }
              canvas.renderAll();
            }
          }} 
          canvas={fabricRef.current} 
        />
        
        <div className="flex-grow flex items-center justify-center p-8 bg-black/40 overflow-hidden relative">
           <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <canvas ref={canvasRef} className="rounded-sm" />
           </div>
           
           {/* AI Floating Buttons */}
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.4)] flex gap-3 group transition-all hover:scale-105 active:scale-95"
              >
                 {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="group-hover:rotate-12 transition-transform" />}
                 <span className="font-black tracking-tight text-lg uppercase">
                    {isGenerating ? "Analyzing Design..." : "Generate Website"}
                 </span>
                 <div className="bg-white/20 px-2 py-1 rounded-md text-[10px] font-bold">AI</div>
              </Button>
           </div>
        </div>

        <PropertiesPanel 
          selectedObject={selectedObject} 
          canvas={fabricRef.current} 
        />
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {isTemplatesOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-4xl bg-[#111111] border border-zinc-800 rounded-3xl overflow-hidden"
             >
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Choose a Wireframe Template</h2>
                   <Button variant="ghost" onClick={() => setIsTemplatesOpen(false)} className="text-zinc-500">Close</Button>
                </div>
                <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { name: "Blank Canvas", json: "{}" },
                     { name: "Landing Page", json: '{"objects":[{"type":"rect","left":100,"top":100,"width":600,"height":400,"fill":"transparent","stroke":"#3B82F6","strokeWidth":2}]}' },
                     { name: "SaaS App", json: '{"objects":[{"type":"rect","left":50,"top":50,"width":200,"height":500,"fill":"#222"}]}' },
                     { name: "Mobile UI", json: '{"objects":[{"type":"rect","left":200,"top":50,"width":375,"height":667,"fill":"transparent","stroke":"#3B82F6","rx":40,"ry":40}]}' }
                   ].map((tpl) => (
                     <div 
                       key={tpl.name}
                       onClick={() => loadTemplate(JSON.parse(tpl.json))}
                       className="group cursor-pointer space-y-3"
                     >
                        <div className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-blue-600 transition-all">
                           <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 group-hover:text-blue-500">
                              <Plus />
                           </div>
                        </div>
                        <p className="text-center text-xs font-bold text-zinc-500 group-hover:text-white uppercase tracking-widest">{tpl.name}</p>
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

