"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { firestore as db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Code, 
  Monitor, 
  Smartphone, 
  Globe, 
  CheckCircle,
  Loader2,
  RefreshCcw,
  ExternalLink,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("desktop"); // desktop, mobile
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject(docSnap.data());
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Launching Preview Sandbox...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="h-16 border-b border-zinc-800 bg-black flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white rounded-full"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
              {project?.name} <span className="text-[10px] text-green-500 font-black tracking-widest px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">LIVE</span>
            </h2>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="hidden md:flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
           <button 
             onClick={() => setView("desktop")}
             className={`p-2 rounded-lg transition-all ${view === "desktop" ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
           >
             <Monitor size={16} />
           </button>
           <button 
             onClick={() => setView("mobile")}
             className={`p-2 rounded-lg transition-all ${view === "mobile" ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
           >
             <Smartphone size={16} />
           </button>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowCode(!showCode)}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 gap-2 h-10 px-4 rounded-full"
          >
            <Code size={16} />
            {showCode ? "Show Preview" : "View Code"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-full font-bold">
            Publish
          </Button>
        </div>
      </nav>

      {/* Main Preview Area */}
      <div className="flex-grow flex relative overflow-hidden bg-[#111111]">
         <div className={`flex-grow h-full flex items-center justify-center p-8 transition-all duration-500 ${showCode ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${view === "mobile" ? 'w-[375px] h-[667px]' : 'w-full h-full'}`}>
               {/* 
                 In a real app, we would use an <iframe> or a dynamic component renderer here.
                 For now, we display the generated structure in a visually accurate container.
               */}
               <div className="w-full h-full overflow-auto bg-black text-white p-10 font-sans">
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="h-20 border-b border-white/10 flex items-center justify-between">
                        <div className="text-xl font-black">AI_SITE.</div>
                        <div className="flex gap-6 text-sm font-medium text-zinc-500 italic">Menu Items Loaded...</div>
                     </div>
                     <div className="py-20 text-center space-y-6">
                        <div className="text-5xl font-black tracking-tight leading-tight">
                           Your AI Website is <span className="text-blue-500">Live & Responsive</span>
                        </div>
                        <p className="text-zinc-500 text-lg max-w-xl mx-auto">
                           This is a real-time preview of the Next.js components generated from your prompt: 
                           <span className="text-white italic"> "{project?.prompt || 'Sketch Layout'}"</span>
                        </p>
                        <div className="flex justify-center gap-4 pt-6">
                           <div className="w-40 h-14 bg-blue-600 rounded-full" />
                           <div className="w-40 h-14 bg-zinc-800 rounded-full" />
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-6 pt-12">
                        <div className="h-64 bg-zinc-900 rounded-3xl border border-zinc-800" />
                        <div className="h-64 bg-zinc-900 rounded-3xl border border-zinc-800" />
                        <div className="h-64 bg-zinc-900 rounded-3xl border border-zinc-800" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Code Sidebar */}
         {showCode && (
           <motion.div 
             initial={{ x: "100%" }}
             animate={{ x: 0 }}
             className="absolute inset-0 bg-[#050505] p-10 overflow-auto z-40"
           >
              <div className="max-w-4xl mx-auto">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                       <Code className="text-blue-500" /> Generated Source Code
                    </h3>
                    <div className="text-xs text-zinc-500 font-mono">NEXT.JS + TAILWIND</div>
                 </div>
                 <pre className="bg-black/50 p-8 rounded-3xl border border-zinc-800 text-blue-400 font-mono text-sm leading-relaxed overflow-x-auto shadow-2xl">
                    {project?.generatedCode || "// No code generated yet."}
                 </pre>
              </div>
           </motion.div>
         )}
      </div>
    </div>
  );
}
