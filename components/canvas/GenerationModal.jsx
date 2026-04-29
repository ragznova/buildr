"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Mic, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Send, 
  Languages, 
  Monitor, 
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Globe,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

export default function GenerationModal({ isOpen, onClose, canvasData, onGenerate }) {
  const [activeTab, setActiveTab] = useState("text"); // text, voice, image, url
  const [prompt, setPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [detectedLang, setDetectedLang] = useState("English");
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Voice Input Logic (Web Speech API)
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("PolyfillSpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setPrompt(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
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

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-[#111111] border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                 <Sparkles className="text-white" size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-black text-white uppercase tracking-tighter">Universal Input Engine</h2>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Milestone 6 • AI Generation</p>
              </div>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white rounded-full">
              <X size={20} />
           </Button>
        </div>

        {/* Content Area */}
        <div className="p-8">
           {/* Tab Selector */}
           <div className="flex gap-2 mb-8 bg-black/40 p-1.5 rounded-2xl border border-zinc-800/50 w-fit">
              {[
                { id: "text", icon: Send, label: "Text" },
                { id: "voice", icon: Mic, label: "Voice" },
                { id: "image", icon: ImageIcon, label: "Visuals" },
                { id: "url", icon: LinkIcon, label: "URL" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                   <tab.icon size={16} />
                   {tab.label}
                </button>
              ))}
           </div>

           <div className="min-h-[240px] relative">
              {/* Text / Voice Input */}
              {(activeTab === "text" || activeTab === "voice") && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                   <div className="relative group">
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={activeTab === "voice" ? "Listening to your voice..." : "Describe your dream website in any language..."}
                        className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl p-6 text-xl font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 transition-all min-h-[180px] resize-none"
                      />
                      
                      {/* Character Counter & Lang Badge */}
                      <div className="absolute bottom-6 right-6 flex items-center gap-3">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-full border border-zinc-700">
                            <Globe size={12} className="text-blue-400" />
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{detectedLang}</span>
                         </div>
                         <span className="text-xs font-mono text-zinc-600">{prompt.length}</span>
                      </div>

                      {/* Floating Voice Toggle */}
                      <button 
                        onClick={toggleRecording}
                        className={`absolute -right-3 -top-3 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-red-600 animate-pulse text-white' : 'bg-zinc-800 text-zinc-400 hover:text-blue-500'}`}
                      >
                         <Mic size={24} className={isRecording ? 'animate-bounce' : ''} />
                      </button>
                   </div>
                </motion.div>
              )}

              {/* Image Upload */}
              {activeTab === "image" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="grid grid-cols-4 gap-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="aspect-square bg-zinc-900 rounded-2xl relative overflow-hidden border border-zinc-800 group">
                           <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                           <button 
                             onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                             className="absolute top-2 right-2 p-1 bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <Trash2 size={12} className="text-white" />
                           </button>
                        </div>
                      ))}
                      <label className="aspect-square bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-600 hover:bg-zinc-800/30 transition-all">
                         <PlusCircle size={24} className="text-zinc-600" />
                         <span className="text-[10px] font-bold text-zinc-500 uppercase">Add Image</span>
                         <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                      </label>
                   </div>
                   <p className="text-zinc-500 text-xs text-center italic">Upload screenshots or sketches for AI style extraction.</p>
                </motion.div>
              )}

              {/* URL Input */}
              {activeTab === "url" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500">
                         <LinkIcon size={20} />
                      </div>
                      <input 
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl py-6 pl-14 pr-6 text-lg font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-600 transition-all"
                      />
                   </div>
                   <div className="flex items-start gap-4 p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl">
                      <AlertCircle className="text-amber-400 flex-shrink-0" size={18} />
                      <p className="text-[11px] text-amber-200/60 leading-relaxed font-medium">
                         AI will analyze the layout and structural components of the URL provided. We do not copy copyrighted content or branding assets directly.
                      </p>
                   </div>
                </motion.div>
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
           <div className="flex items-center gap-4 text-zinc-500">
              <div className="flex items-center gap-2">
                 <CheckCircle2 size={14} className={canvasData ? 'text-green-500' : 'text-zinc-700'} />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Canvas Attached</span>
              </div>
           </div>

           <Button 
             onClick={handleSubmit}
             disabled={!prompt && !url && files.length === 0}
             className="bg-blue-600 hover:bg-blue-700 h-14 px-10 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)] group transition-all hover:scale-105 active:scale-95"
           >
              <span className="font-black tracking-tight text-lg uppercase mr-3">Start Building</span>
              <Sparkles className="group-hover:rotate-12 transition-transform text-white" size={20} />
           </Button>
        </div>
      </motion.div>
    </div>
  );
}
