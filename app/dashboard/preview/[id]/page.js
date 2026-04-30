'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Preview({ params }) {
  const [html, setHtml] = useState('');
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
        <p className="text-white text-xl font-bold uppercase tracking-tighter">Loading Preview...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex items-center justify-between p-4 bg-[#111111] border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="text-white bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full text-xs font-bold uppercase transition-all"
        >
          ← Back
        </button>
        <span className="text-white font-black uppercase tracking-tighter italic">
          BUILDR Preview
        </span>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase transition-all shadow-lg shadow-blue-600/20">
          Publish
        </button>
      </div>
      <iframe
        srcDoc={html}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-forms"
        title="BUILDR Preview"
      />
    </div>
  );
}
