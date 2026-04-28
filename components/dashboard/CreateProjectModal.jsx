"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Rocket, Globe, Palette, ShoppingBag, BookOpen, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/useProjectStore";
import { useAuthStore } from "@/store/useAuthStore";

const projectTypes = [
  { id: "website", name: "Website", icon: Globe },
  { id: "landing", name: "Landing Page", icon: Rocket },
  { id: "portfolio", name: "Portfolio", icon: Palette },
  { id: "ecommerce", name: "Ecommerce", icon: ShoppingBag },
  { id: "blog", name: "Blog", icon: BookOpen },
  { id: "mobile", name: "Mobile App", icon: Smartphone },
];

const techStacks = [
  { id: "html", name: "HTML/CSS" },
  { id: "react", name: "React.js" },
  { id: "nextjs", name: "Next.js" },
];

export default function CreateProjectModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("website");
  const [techStack, setTechStack] = useState("html");
  const [loading, setLoading] = useState(false);
  
  const { createProject } = useProjectStore();
  const { user, userData } = useAuthStore();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Check project limit
    if (userData?.plan === "free" && userData?.projectCount >= 3) {
      alert("You have reached the limit of 3 projects on the Free plan. Please upgrade to create more!");
      return;
    }

    setLoading(true);
    try {
      await createProject(user.uid, { name, type, techStack });
      onClose();
      // In a real app, redirect here
    } catch (error) {
      alert("Error creating project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#111111] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
           <h2 className="text-xl font-bold text-white">Create New Project</h2>
           <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleCreate} className="p-8 space-y-8">
           <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Project Name</label>
              <Input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                className="bg-black border-zinc-800 h-14 text-lg rounded-xl focus:ring-blue-600"
              />
           </div>

           <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Project Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {projectTypes.map((pType) => (
                   <div 
                     key={pType.id}
                     onClick={() => setType(pType.id)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-3 ${type === pType.id ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                   >
                      <pType.icon size={24} />
                      <span className="text-xs font-bold">{pType.name}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Tech Stack</label>
              <div className="flex gap-3">
                 {techStacks.map((stack) => (
                   <div 
                     key={stack.id}
                     onClick={() => setTechStack(stack.id)}
                     className={`flex-1 p-3 rounded-xl border text-center cursor-pointer transition-all font-bold text-xs ${techStack === stack.id ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                   >
                      {stack.name}
                   </div>
                 ))}
              </div>
           </div>

           <div className="pt-4 flex items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 max-w-[200px]">
                 Building on **{techStack}** as a **{type}**. This can be changed later.
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-xl text-white font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Start Building"}
              </Button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
