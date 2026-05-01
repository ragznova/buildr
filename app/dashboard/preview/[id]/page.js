'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Smartphone, ArrowLeft, Download, ExternalLink } from 'lucide-react';

export default function Preview({ params }) {
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState('desktop');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('generatedHTML');
    if (stored) {
      setHtml(stored);
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  if (!html) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="w-12 h-12 border-2 border-t-blue-500 border-white/10 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0A]">
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111111] shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Editor
          </button>
          <div className="h-5 w-px bg-white/10"></div>
          <span className="text-white font-black text-sm uppercase tracking-tighter italic">BUILDR Preview</span>
        </div>

        <div className="flex items-center gap-2 bg-black/50 p-1 rounded-full border border-white/10">
          <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-full transition ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
            <Monitor size={16} />
          </button>
          <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-full transition ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
            <Smartphone size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => { const blob = new Blob([html], {type:'text/html'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'website.html'; a.click(); }} className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm border border-white/10 px-4 py-2 rounded-full">
            <Download size={14} />
            Export
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition shadow-lg shadow-blue-600/20">
            Publish
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-8 overflow-auto bg-[#050505]">
        <div className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${viewMode === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'}`}>
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="BUILDR Preview"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
