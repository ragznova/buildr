import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, activeTab, canvasData, files, url, language, layoutDesc, userPlan = "free" } = body;

    const masterPrompt = `
      You are BUILDR AI, a world-class frontend engineer and UI/UX designer.
      Task: Generate a high-quality, production-ready React component using Next.js and Tailwind CSS.

      CONTEXT:
      - Project Name: ${prompt || "AI Project"}
      - User Intent: ${prompt}
      - Input Method: ${activeTab}
      - Detected Language: ${language}
      - Drawing/Sketch Layout: ${layoutDesc || "No drawing provided"}
      - Reference URL Structure: ${url || "None"}
      
      TECHNICAL SPECS:
      - Framework: Next.js (App Router compatible).
      - Styling: Tailwind CSS (Mobile-first, responsive).
      - Icons: Lucide React.
      - Theme: Modern, dark-themed (unless prompt specifies otherwise).
      - Tone: Professional, premium, and clean.

      REQUIREMENTS:
      1. Create a complete landing page structure including Header, Hero, Features, and Footer.
      2. If a Drawing Layout is provided, follow the positions of elements strictly.
      3. Use vibrant colors and smooth transitions.
      4. Ensure all Tailwind classes are valid and descriptive.
      5. Include sample text content in ${language}.

      OUTPUT RULES:
      - Return ONLY the raw code.
      - NO markdown formatting (no backticks, no "javascript" header).
      - NO explanations.
      - MUST start with "import React from 'react';".
    `;

    console.log(`[AI ROUTER] Attempting Generation for ${userPlan} user...`);

    let text = "";
    let modelUsed = "";

    try {
      console.log("[AI ROUTER] Trying Gemini (Flash Latest)...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(masterPrompt);
      const response = await result.response;
      text = response.text();
      modelUsed = "gemini-1.5-flash-latest";
    } catch (geminiError) {
      console.error("[AI ROUTER] Gemini Failed, falling back to Groq...", geminiError.message);
      
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: "user", content: masterPrompt }],
        model: "llama-3.3-70b-versatile",
      });
      
      text = groqResponse.choices[0].message.content;
      modelUsed = "groq-llama-3.3-70b";
    }

    // Clean up any potential markdown leftovers
    text = text.replace(/```javascript/g, "").replace(/```jsx/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ 
      success: true, 
      code: text,
      modelUsed: modelUsed,
      metadata: {
        timestamp: new Date().toISOString(),
        plan: userPlan
      }
    });

  } catch (error) {
    console.error("AI Router Critical Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate code." 
    }, { status: 500 });
  }
}
