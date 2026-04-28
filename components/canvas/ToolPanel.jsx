"use client";

import * as fabric from "fabric";
import { 
  MousePointer2, 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Minus, 
  Eraser,
  Hand
} from "lucide-react";

const tools = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "text", icon: Type, label: "Text" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export default function ToolPanel({ activeTool, setActiveTool, canvas }) {
  
  const addShape = (type) => {
    if (!canvas) return;
    
    let object;
    const commonProps = {
      left: 100,
      top: 100,
      fill: "transparent",
      stroke: "#3B82F6",
      strokeWidth: 2,
    };

    if (type === "rect") {
      object = new fabric.Rect({
        ...commonProps,
        width: 100,
        height: 100,
      });
    } else if (type === "circle") {
      object = new fabric.Circle({
        ...commonProps,
        radius: 50,
      });
    } else if (type === "text") {
      object = new fabric.IText("Type something...", {
        ...commonProps,
        fontSize: 20,
        fill: "#FFFFFF",
        strokeWidth: 0,
      });
    } else if (type === "line") {
      object = new fabric.Line([50, 50, 150, 50], {
        ...commonProps,
      });
    }

    if (object) {
      canvas.add(object);
      canvas.setActiveObject(object);
      setActiveTool("select");
    }
  };

  return (
    <aside className="w-16 bg-[#111111] border-r border-zinc-800 flex flex-col items-center py-6 gap-4 z-10">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => {
            if (["rect", "circle", "text", "line"].includes(tool.id)) {
              addShape(tool.id);
            } else {
              setActiveTool(tool.id);
            }
          }}
          className={`p-3 rounded-xl transition-all relative group ${
            activeTool === tool.id 
            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
            : "text-zinc-500 hover:text-white hover:bg-zinc-800"
          }`}
          title={tool.label}
        >
          <tool.icon size={20} />
          <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 uppercase tracking-widest">
             {tool.label}
          </span>
        </button>
      ))}
    </aside>
  );
}
