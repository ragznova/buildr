"use client";

import Link from "next/link";
import { 
  Undo2, 
  Redo2, 
  Save, 
  Download, 
  Plus, 
  Minus, 
  ChevronLeft,
  CheckCircle2,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Toolbar({ project, onUndo, onRedo, onSave, isSaving, zoom, setZoom, onOpenTemplates }) {
  return (
    <header className="h-16 bg-[#111111] border-b border-zinc-800 flex items-center justify-between px-6 z-20">
      {/* Left Area: Back & Project Info */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
           <ChevronLeft size={20} />
        </Link>
        <div className="h-6 w-[1px] bg-zinc-800" />
        <div>
           <h2 className="text-sm font-bold text-white tracking-tight">{project?.name || "Untitled Project"}</h2>
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Autosave Active</span>
           </div>
        </div>
      </div>

      {/* Center Area: Undo/Redo & Zoom */}
      <div className="flex items-center gap-2 bg-black rounded-xl p-1 border border-zinc-800">
         <Button 
           variant="ghost" 
           size="icon" 
           className="text-zinc-500 hover:text-white h-8 w-8"
           onClick={onUndo}
         >
           <Undo2 size={16} />
         </Button>
         <Button 
           variant="ghost" 
           size="icon" 
           className="text-zinc-500 hover:text-white h-8 w-8"
           onClick={onRedo}
         >
           <Redo2 size={16} />
         </Button>
         <div className="h-4 w-[1px] bg-zinc-800 mx-1" />
         <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-500 hover:text-white h-8 w-8"
              onClick={() => setZoom(Math.max(10, zoom - 10))}
            >
              <Minus size={14} />
            </Button>
            <span className="text-[10px] font-black text-zinc-400 min-w-[40px] text-center">{zoom}%</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-zinc-500 hover:text-white h-8 w-8"
              onClick={() => setZoom(Math.min(300, zoom + 10))}
            >
              <Plus size={14} />
            </Button>
         </div>
      </div>

      {/* Right Area: Actions */}
      <div className="flex items-center gap-3">
         <Button 
           variant="outline" 
           className="border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-2 h-10 px-4 rounded-xl text-xs font-bold"
           onClick={onOpenTemplates}
         >
            <Plus size={16} /> Load Template
         </Button>
         <Button 
           variant="outline" 
           className="border-zinc-800 hover:bg-zinc-800 text-zinc-400 gap-2 h-10 px-4 rounded-xl text-xs font-bold"
           onClick={() => {
              // Implementation for PNG export would go here
              alert("Exporting as PNG...");
           }}
         >
            <Download size={16} /> Export
         </Button>

         <Button 
           className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-10 px-6 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20"
           onClick={onSave}
           disabled={isSaving}
         >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Save Project
              </>
            )}
         </Button>
      </div>
    </header>
  );
}
