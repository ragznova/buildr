"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChevronLeft, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!db || !params.id) {
        console.warn("[PREVIEW DEBUG] DB or ID not ready.");
        return;
      }
      
      console.log("[PREVIEW DEBUG] Fetching project with ID:", params.id);
      try {
        const docRef = doc(db, "projects", params.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("[PREVIEW DEBUG] Document found in Firebase.");
          console.log("[PREVIEW DEBUG] HTML Content Length:", data.generatedHTML?.length || 0);
          
          if (!data.generatedHTML) {
            setError("No website content found in this project.");
          } else {
            setHtml(data.generatedHTML);
          }
        } else {
          console.error("[PREVIEW DEBUG] Document NOT FOUND in Firebase for ID:", params.id);
          setError("Project not found. Please check the URL or try generating again.");
        }
      } catch (err) {
        console.error("[PREVIEW DEBUG] Firebase Error:", err);
        setError("Failed to connect to the database.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Preview Data...</p>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Generation Failed</h1>
        <p className="text-zinc-500 mb-8 max-w-md">{error || "The AI failed to deliver the code. This can happen during peak traffic."}</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => router.back()}
            className="px-8 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
          >
            Go Back to Canvas
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20"
          >
            <RefreshCw size={18} /> Retry Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Floating Back Button */}
      <button 
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-2xl"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Instant Iframe Preview */}
      <iframe 
        srcDoc={html}
        className="w-full h-full border-none bg-white"
        title="Live Preview"
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
