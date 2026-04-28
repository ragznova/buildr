"use client";

import { useEffect, useState } from "react";
import { 
  BringToFront, 
  SendToBack, 
  Trash2, 
  Copy,
  Layers,
  Palette,
  Type as TypeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PropertiesPanel({ selectedObject, canvas }) {
  const [props, setProps] = useState({
    fill: "#ffffff",
    stroke: "#3B82F6",
    strokeWidth: 2,
    fontSize: 20,
    opacity: 1,
  });

  useEffect(() => {
    if (selectedObject) {
      setProps({
        fill: selectedObject.fill || "#ffffff",
        stroke: selectedObject.stroke || "#3B82F6",
        strokeWidth: selectedObject.strokeWidth || 2,
        fontSize: selectedObject.fontSize || 20,
        opacity: selectedObject.opacity || 1,
      });
    }
  }, [selectedObject]);

  const updateProperty = (key, value) => {
    if (!selectedObject || !canvas) return;
    
    selectedObject.set(key, value);
    setProps({ ...props, [key]: value });
    canvas.renderAll();
  };

  if (!selectedObject) {
    return (
      <aside className="w-64 bg-[#111111] border-l border-zinc-800 p-6 z-10 flex flex-col items-center justify-center text-center">
         <Layers className="text-zinc-800 mb-4" size={48} />
         <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-widest">No Object Selected</h4>
         <p className="text-zinc-700 text-[10px] mt-2">Select an element on the canvas to edit its properties.</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#111111] border-l border-zinc-800 p-6 z-10 overflow-y-auto custom-scrollbar">
      <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-8">Properties</h3>

      <div className="space-y-8">
        {/* Colors */}
        <div className="space-y-4">
           <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Palette size={12} /> Colors
           </label>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <span className="text-[9px] text-zinc-600 uppercase font-black">Fill</span>
                 <input 
                   type="color" 
                   value={props.fill === "transparent" ? "#000000" : props.fill}
                   onChange={(e) => updateProperty("fill", e.target.value)}
                   className="w-full h-8 bg-black border border-zinc-800 rounded cursor-pointer"
                 />
              </div>
              <div className="space-y-2">
                 <span className="text-[9px] text-zinc-600 uppercase font-black">Stroke</span>
                 <input 
                   type="color" 
                   value={props.stroke}
                   onChange={(e) => updateProperty("stroke", e.target.value)}
                   className="w-full h-8 bg-black border border-zinc-800 rounded cursor-pointer"
                 />
              </div>
           </div>
        </div>

        {/* Stroke Width */}
        <div className="space-y-4">
           <label className="text-[10px] font-bold text-zinc-500 uppercase">Stroke Width</label>
           <input 
             type="range" 
             min="0" 
             max="20" 
             value={props.strokeWidth}
             onChange={(e) => updateProperty("strokeWidth", parseInt(e.target.value))}
             className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-600"
           />
        </div>

        {/* Font size for Text */}
        {selectedObject.type === "i-text" && (
           <div className="space-y-4 pt-4 border-t border-zinc-800">
              <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">
                 <TypeIcon size={12} /> Typography
              </label>
              <div className="space-y-2">
                 <span className="text-[9px] text-zinc-600 uppercase font-black">Font Size</span>
                 <Input 
                   type="number"
                   value={props.fontSize}
                   onChange={(e) => updateProperty("fontSize", parseInt(e.target.value))}
                   className="bg-black border-zinc-800 h-8 text-xs"
                 />
              </div>
           </div>
        )}

        {/* Actions */}
        <div className="pt-8 border-t border-zinc-800 space-y-4">
           <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Arrangement</label>
           <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="border-zinc-800 hover:bg-zinc-800 h-10 gap-2 text-[10px]"
                onClick={() => {
                  selectedObject.bringForward();
                  canvas.renderAll();
                }}
              >
                <BringToFront size={14} /> Forward
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-800 hover:bg-zinc-800 h-10 gap-2 text-[10px]"
                onClick={() => {
                  selectedObject.sendBackwards();
                  canvas.renderAll();
                }}
              >
                <SendToBack size={14} /> Backward
              </Button>
           </div>
           <Button 
             variant="ghost" 
             className="w-full text-red-500 hover:bg-red-500/10 h-10 gap-2 text-[10px]"
             onClick={() => {
               canvas.remove(selectedObject);
               canvas.discardActiveObject();
               canvas.renderAll();
             }}
           >
             <Trash2 size={14} /> Delete Element
           </Button>
        </div>
      </div>
    </aside>
  );
}
