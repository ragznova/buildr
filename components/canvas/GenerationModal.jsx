"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mic, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send, 
  Monitor, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Globe,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GenerationModal({ isOpen, onClose, canvasData, onGenerate }) {
  const [activeTab, setActiveTab] = useState("text"); // text, voice, image, url
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectedLang, setDetectedLang] = useState("English");
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");
  
  // Voice Input Logic
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setPrompt(transcript);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
      setActiveTab("voice");
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
    setActiveTab("image");
  };

  const handleSubmit = () => {
    onGenerate({
      prompt,
      activeTab,
      canvasData,
      files,
      url,
      language: detectedLang
    });
  };

  if (!isOpen) return null;

  // FIX 3 — SMART TEMPLATE MATCHING
  const analyzeCanvas = () => {
    if (!canvasData || !canvasData.objects) return { type: "Minimal", thumbnails: ["/temp1.png", "/temp2.png", "/temp3.png"] };
    const rects = canvasData.objects.filter(o => o.type === "rect");
    const topRects = rects.filter(r => r.top < 150);
    const midRects = rects.filter(r => r.top > 150 && r.top < 500);
    
    if (topRects.length >= 1 && midRects.length >= 3) return { type: "Landing Page", thumbnails: ["/lp1.png", "/lp2.png", "/lp3.png"] };
    if (rects.length > 6) return { type: "Portfolio", thumbnails: ["/port1.png", "/port2.png", "/port3.png"] };
    return { type: "Business Site", thumbnails: ["/biz1.png", "/biz2.png", "/biz3.png"] };
  };

  const suggestion = analyzeCanvas();

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 md:p-10">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          onClick={onClose}
        />
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-6xl bg-[#0A0A0A] border border-white/10 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* LEFT SIDE: SMART MATCHING (FIX 3) */}
        <div className="w-full md:w-[380px] bg-white/5 p-10 border-r border-white/5 flex flex-col">
           <div className="flex-grow">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest mb-8">
                 <Sparkles size={12} /> AI Analysis Active
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                 Your sketch looks like a <span className="text-blue-500">{suggestion.type}</span>
              </h3>
              <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
                 We analyzed your wireframe structure. These premium templates match your layout:
              </p>

              <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative aspect-video bg-zinc-900 rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all">
                       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                       <div className="absolute bottom-4 left-4 text-[10px] font-bold text-white/40 group-hover:text-white transition-colors">
                          PREMIUM LAYOUT {i}
                       </div>
                       {/* Placeholder for template thumbnail */}
                       <div className="w-full h-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                    </div>
                 ))}
              </div>
           </div>

           <div className="mt-10 pt-8 border-t border-white/5 space-y-3">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 gap-3">
                 <Monitor size={18} /> Use Template
              </Button>
              <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest">or generate custom below</p>
           </div>
        </div>

        {/* RIGHT SIDE: MAIN INPUT */}
        <div className="flex-grow flex flex-col bg-black">
           {/* Header */}
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">Universal Engine</h2>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Milestone 6 • Generation Engine</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5">
                 <X size={20} className="text-zinc-500" />
              </Button>
           </div>

           {/* Tabs */}
           <div className="p-8 flex-grow overflow-y-auto">
              <div className="flex gap-2 mb-10 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-fit">
                 {[
                   { id: "text", icon: Send, label: "Text" },
                   { id: "voice", icon: Mic, label: "Voice" },
                   { id: "image", icon: ImageIcon, label: "Visuals" },
                   { id: "url", icon: LinkIcon, label: "URL" }
                 ].map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-zinc-500 hover:text-white'}`}
                   >
                      <tab.icon size={14} />
                      {tab.label}
                   </button>
                 ))}
              </div>

              {/* Input Area */}
              <div className="min-h-[300px]">
                 {(activeTab === "text" || activeTab === "voice") && (
                   <div className="relative">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={activeTab === "voice" ? "Listening..." : "What are we building today? (e.g. A luxury hotel site in Hindi)"}
                        className="w-full bg-transparent border-none text-2xl font-medium text-white placeholder:text-white/10 focus:outline-none min-h-[250px] resize-none"
                      />
                      <div className="absolute bottom-0 right-0 flex items-center gap-4">
                         <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                            <Globe size={12} className="text-blue-500" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{detectedLang}</span>
                         </div>
                         <button 
                           onClick={toggleRecording}
                           className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-white/5 hover:bg-white/10'}`}
                         >
                            <Mic size={24} className={isRecording ? 'text-white' : 'text-zinc-500'} />
                         </button>
                      </div>
                   </div>
                 )}

                 {activeTab === "image" && (
                   <div className="grid grid-cols-3 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="aspect-square bg-white/5 rounded-3xl border border-white/5 relative group overflow-hidden">
                           <img src={URL.createObjectURL(file)} alt="Ref" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                           <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="absolute top-4 right-4 p-2 bg-red-600/20 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all text-zinc-500 hover:text-white">
                         <PlusCircle size={32} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Add Reference</span>
                         <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                      </label>
                   </div>
                 )}

                 {activeTab === "url" && (
                   <div className="space-y-6">
                      <input 
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://ajio.com"
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-8 px-10 text-xl text-white focus:outline-none focus:border-blue-600 transition-all"
                      />
                      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex gap-4">
                         <AlertCircle className="text-blue-500 shrink-0" size={20} />
                         <p className="text-sm text-zinc-400 leading-relaxed">
                            Paste a URL to help the AI understand the industry and structural conventions. BUILDR generates unique code from scratch.
                         </p>
                      </div>
                   </div>
                 )}
              </div>
           </div>

           {/* Footer */}
           <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4 text-zinc-500">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={canvasData ? 'text-green-500' : 'text-zinc-800'} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Canvas Linked</span>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button 
                   onClick={() => onGenerate({ prompt: "Build from Sketch", activeTab: "drawing", canvasData })}
                   className="h-16 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all active:scale-95 border border-white/5"
                 >
                    Build from Sketch
                 </button>
                 <Button 
                   onClick={handleSubmit}
                   className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base uppercase tracking-tight shadow-2xl shadow-blue-600/30 group"
                 >
                    Start AI Generation
                    <Sparkles size={18} className="ml-3 group-hover:rotate-12 transition-transform" />
                 </Button>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
