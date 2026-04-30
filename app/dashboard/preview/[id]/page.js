'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreviewPage({ params }) {
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure localStorage is hydrated
    const timer = setTimeout(() => {
      const stored = localStorage.getItem('generatedHTML');
      if (stored) {
        setHtml(stored);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0A] text-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Launching Preview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111111]">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400">
            <ChevronLeft size={20} />
            Back to Editor
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-white font-bold text-sm uppercase tracking-tighter">Live Preview</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 h-9 px-6 rounded-full text-xs font-bold uppercase">
            Publish Site
          </Button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="flex-grow bg-white">
        {html ? (
          <iframe
            srcDoc={html}
            title="Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            No preview available. Go back and generate again.
          </div>
        )}
      </div>
    </div>
  );
}
