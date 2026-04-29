"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { 
  Monitor, 
  Smartphone, 
  Code2, 
  Eye, 
  ArrowLeft, 
  ChevronLeft,
  Loader2,
  Copy,
  ExternalLink,
  Sparkles,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("desktop"); // desktop, mobile
  const [activeTab, setActiveTab] = useState("preview"); // preview, code
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject(docSnap.data());
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project?.generatedCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Launching Preview Engine...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col overflow-hidden">
      {/* HEADER / TOOLBAR */}
      <div className="h-20 bg-black/50 border-b border-white/5 flex items-center justify-between px-8 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-black uppercase tracking-tighter text-xl flex items-center gap-3">
              {project?.name || "Untitled Project"}
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[10px] font-black text-blue-500">LIVE PREVIEW</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{project?.prompt || "Custom Design"}</p>
          </div>
        </div>

        {/* PREVIEW VS CODE TOGGLE */}
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "preview" ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            <Eye size={14} /> Preview
          </button>
          <button 
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "code" ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            <Code2 size={14} /> React Code
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-4">
            <button 
              onClick={() => setViewMode("desktop")}
              className={`p-2.5 rounded-lg transition-all ${viewMode === "desktop" ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Monitor size={18} />
            </button>
            <button 
              onClick={() => setViewMode("mobile")}
              className={`p-2.5 rounded-lg transition-all ${viewMode === "mobile" ? 'bg-white/10 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Smartphone size={18} />
            </button>
          </div>
          <Button onClick={handleCopyCode} className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl font-bold flex gap-2">
            {copySuccess ? <Eye size={16} /> : <Copy size={16} />}
            {copySuccess ? "COPIED!" : "EXPORT CODE"}
          </Button>
        </div>
      </div>

      {/* MAIN PREVIEW AREA */}
      <div className="flex-grow p-10 bg-[radial-gradient(circle_at_center,_#111111_0%,_#000000_100%)] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "preview" ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700 border-[12px] border-zinc-900 ${viewMode === "desktop" ? 'w-full h-full' : 'w-[400px] h-[800px]'}`}
            >
              {/* INSTANT IFRAME PREVIEW (FIX 1 & 3) */}
              <iframe 
                srcDoc={project?.generatedHtml || "<html><body><h1 style='color: white; font-family: sans-serif; text-align: center; margin-top: 50px;'>No preview data found. Try generating again.</h1></body></html>"}
                className="w-full h-full border-none"
                title="Website Preview"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="code"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-6xl h-full bg-[#0F0F0F] rounded-3xl border border-white/5 overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">NEXT.js + TAILWIND Component</span>
                </div>
                <Button variant="ghost" onClick={handleCopyCode} className="text-zinc-500 hover:text-white gap-2">
                  <Copy size={14} /> Copy Code
                </Button>
              </div>
              <pre className="flex-grow p-10 overflow-auto text-blue-400 font-mono text-sm leading-relaxed selection:bg-blue-500/30">
                <code>{project?.generatedCode || "// No code available."}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER STATS */}
      <div className="h-12 border-t border-white/5 bg-black px-8 flex items-center justify-between">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Globe size={12} className="text-zinc-700" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Build v1.0.4</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-zinc-700" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">AI Engine: Gemini Pro</span>
          </div>
        </div>
        <p className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">BUILDR © 2026</p>
      </div>
    </div>
  );
}
