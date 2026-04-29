import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, activeTab, canvasData, files, url, language, layoutDesc, userPlan = "free" } = body;

    console.log(`[AI ROUTER] Processing request for ${userPlan} user...`);

    // 1. CHOOSE PRIMARY API BASED ON PLAN
    let primaryAPI = "GEMINI"; // Default for Free
    let model = "gemini-1.5-pro";

    if (userPlan === "pro" || userPlan === "ultra") {
      primaryAPI = "CLAUDE";
      model = "claude-3-5-sonnet";
    }

    // 2. CONSTRUCT MASTER PROMPT
    const masterPrompt = `
      You are BUILDR AI, a professional full-stack developer.
      Generate a complete, production-ready Next.js website using Tailwind CSS.

      USER INPUT: ${prompt || "Generate a modern website based on the layout."}
      INPUT METHOD: ${activeTab}
      INPUT LANGUAGE: ${language}
      LAYOUT CONTEXT: ${layoutDesc}
      REFERENCE URL: ${url || "None"}
      
      TECHNICAL REQUIREMENTS:
      - Use React functional components with Tailwind CSS.
      - Ensure mobile-responsiveness (mobile-first approach).
      - Style: Modern, sleek, professional.
      - Theme: Dark mode preferred unless specified otherwise.
      - Components to include: ${layoutDesc ? "Header, Hero, Features, Footer based on user drawing" : "Standard high-converting sections"}.

      RETURN ONLY CLEAN CODE. DO NOT INCLUDE ANY EXPLANATIONS OR MARKDOWN FORMATTING.
      START WITH "import React from 'react';".
    `;

    // 3. API FALLBACK SYSTEM (Logic Simulation)
    let generatedCode = "";
    let success = false;

    try {
      console.log(`[API 1] Attempting ${primaryAPI}...`);
      // Here we would call fetch(GEMINI_API_URL, { ... })
      // For now, we return a high-quality structural template as simulation
      generatedCode = `
import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function GeneratedSite() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-blue-500/30">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-black tracking-tighter">BUILDR.<span className="text-blue-500">AI</span></div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        <button className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-zinc-200 transition-all">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-8">
          <Sparkles size={12} />
          AI Generated Architecture
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          The Future is <br/> Built by AI.
        </h1>
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
          Your description "${prompt}" has been analyzed and transformed into this production-ready deployment.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 group transition-all">
            Explore Features <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-4 rounded-full font-bold transition-all border border-zinc-800">
            View Source Code
          </button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-white/[0.02]">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1,2,3].map((i) => (
            <div key={i} className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-blue-500/50 transition-all group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-bold mb-4">Feature Segment {i}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                High-performance component generated based on your input language and layout specifications.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-xs font-medium">
        &copy; 2026 BUILDR. Created in ${language}. Plan: ${userPlan}.
      </footer>
    </div>
  );
}
      `;
      success = true;
    } catch (err) {
      console.log(`[API 1] FAILED. Switching to Fallback...`);
      // Fallback to GROQ/Mistral logic would go here
    }

    return NextResponse.json({ 
      success, 
      code: generatedCode,
      modelUsed: model,
      metadata: {
        timestamp: new Date().toISOString(),
        plan: userPlan
      }
    });

  } catch (error) {
    console.error("AI Generation Route Error:", error);
    return NextResponse.json({ error: "Failed to generate code." }, { status: 500 });
  }
}
