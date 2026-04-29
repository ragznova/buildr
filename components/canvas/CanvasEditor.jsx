"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as fabric from "fabric";
import ToolPanel from "./ToolPanel";
import PropertiesPanel from "./PropertiesPanel";
import Toolbar from "./Toolbar";
import { firestore as db } from "@/lib/firebase/config";
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
  const [activeTool, setActiveTool] = useState("select");
  const [selectedObject, setSelectedObject] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const sidebarWidth = isSidebarCollapsed ? 80 : 256;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth - sidebarWidth - 300, // Sidebar + Properties panel
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
    canvas.on("object:added", (e) => {
      if (!e.target._fromJSON) saveHistory();
    });
    canvas.on("path:created", () => saveHistory()); // Save history after pencil stroke

    // Shortcuts
    const handleKeyDown = (e) => {
      // Don't delete if we are typing in a text box!
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.isEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        canvas.remove(...activeObjects);
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
  }, [project]);

  // Handle Dynamic Resizing
  useEffect(() => {
    const handleResize = () => {
      if (fabricRef.current) {
        const sidebarWidth = isSidebarCollapsed ? 80 : 256;
        const availableWidth = window.innerWidth - sidebarWidth - 340; // More padding for properties
        const availableHeight = window.innerHeight - 100; // More padding for toolbar
        
        fabricRef.current.setDimensions({
          width: Math.max(800, availableWidth),
          height: Math.max(600, availableHeight)
        });
        fabricRef.current.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarCollapsed]);

  // --- Save to Firebase ---
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

  // History Management (Refined)
  const saveHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      // Don't save duplicate states
      if (newHistory[newHistory.length - 1] === json) return prev;
      return [...newHistory, json];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const prevIndex = historyIndex - 1;
    const state = JSON.parse(history[prevIndex]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
      setHistoryIndex(prevIndex);
    });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const nextIndex = historyIndex + 1;
    const state = JSON.parse(history[nextIndex]);
    
    fabricRef.current.loadFromJSON(state).then(() => {
      fabricRef.current.renderAll();
      setHistoryIndex(nextIndex);
    });
  };

  const loadTemplate = (templateJson) => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = "#1A1A1A";
    fabricRef.current.loadFromJSON(templateJson).then(() => {
      fabricRef.current.renderAll();
      saveHistory();
      setIsTemplatesOpen(false);
    });
  };

  const handleGenerate = async (data) => {
    setIsGenModalOpen(false);
    setIsGenerating(true);
    
    // FIX 1 — CANVAS TO DESCRIPTION CONVERTER (Fabric.js JSON -> Human Story)
    const canvasObjects = fabricRef.current?.toJSON().objects || [];
    const canvasWidth = fabricRef.current?.width || 1200;
    const canvasHeight = fabricRef.current?.height || 800;

    const describeLayout = () => {
      if (canvasObjects.length === 0) return "No wireframe provided. Generate a creative layout from scratch.";
      
      let description = "The user drew a wireframe with the following elements:\n";
      
      canvasObjects.forEach((obj, i) => {
        const isTop = obj.top < canvasHeight * 0.2;
        const isBottom = obj.top > canvasHeight * 0.8;
        const isMiddle = !isTop && !isBottom;
        
        const isFullWidth = obj.width * obj.scaleX > canvasWidth * 0.8;
        const isSmall = (obj.width * obj.scaleX * obj.height * obj.scaleY) < (canvasWidth * canvasHeight * 0.05);
        
        let position = isTop ? "at the TOP (HEADER AREA)" : isBottom ? "at the BOTTOM (FOOTER AREA)" : "in the MIDDLE (CONTENT AREA)";
        let size = isFullWidth ? "LARGE FULL-WIDTH" : isSmall ? "SMALL" : "MEDIUM";
        let type = obj.type === "rect" ? "Rectangle" : obj.type === "circle" ? "Circle" : obj.type === "i-text" ? "Text Label" : "Shape";

        description += `- A ${size} ${type} ${position}. `;
        if (obj.text) description += `Label: "${obj.text}". `;
        description += "\n";
      });

      return description;
    };

    const layoutDesc = describeLayout();
    console.log("[AI BRIDGE] Generated Description:", layoutDesc);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...data, 
          layoutDesc,
          projectId: project.id,
          userPlan: project?.userPlan || "free" 
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("[CANVAS BRIDGE] AI returned HTML. Length:", result.html?.length);
        console.log("[CANVAS BRIDGE] Server handled the Firebase save ✅");

        // Redirect to preview
        router.push(`/dashboard/preview/${project.id}`);
      } else {
        alert(`Generation failed: ${result.error || "Unknown Error"}`);
      }
    } catch (err) {
      console.error("Generation Error:", err);
      alert("A network error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Zoom implementation
  useEffect(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(zoom / 100);
  }, [zoom]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] relative">
      {/* AI Analyzing Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
             <div className="relative w-32 h-32 mb-8">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-t-2 border-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
                <div className="absolute inset-4 border-r-2 border-blue-400/30 rounded-full animate-reverse-spin" />
                <Sparkles className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={40} />
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Analyzing Design</h2>
             <p className="text-zinc-500 max-w-xs text-sm font-medium">
                Our Neural Engine is scanning your sketches to generate high-fidelity code components...
             </p>
             <div className="mt-8 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                  />
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      
      <GenerationModal 
        isOpen={isGenModalOpen} 
        onClose={() => setIsGenModalOpen(false)} 
        canvasData={fabricRef.current?.toJSON()}
        onGenerate={handleGenerate}
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
                onClick={() => setIsGenModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 h-14 px-8 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.4)] flex gap-3 group transition-all hover:scale-105 active:scale-95"
              >
                 <Sparkles className="group-hover:rotate-12 transition-transform" />
                 <span className="font-black tracking-tight text-lg uppercase">
                    Generate Website
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


