"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function PreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHtml(docSnap.data().generatedHTML || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
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
        className="w-full h-full border-none"
        title="Live Preview"
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
