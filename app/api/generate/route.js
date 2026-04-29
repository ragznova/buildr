import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, activeTab, canvasData, files, url, language, layoutDesc, userPlan = "free" } = body;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyAmyzzOaXV24JsriRqBceBI9VkYqFiqQVU";
    
    if (!apiKey) {
      console.error("[AI ERROR] Gemini API Key is missing from environment variables.");
      return NextResponse.json({ success: false, error: "API Key Missing" }, { status: 500 });
    }

    console.log(`[AI ROUTER] Initializing Real Gemini Generation for ${userPlan} user...`);

    // Use gemini-pro for stability
    const modelName = "gemini-pro";
    const model = genAI.getGenerativeModel({ model: modelName });

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

    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any potential markdown leftovers from the AI
    text = text.replace(/```javascript/g, "").replace(/```jsx/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ 
      success: true, 
      code: text,
      modelUsed: "gemini-1.5-pro",
      metadata: {
        timestamp: new Date().toISOString(),
        plan: userPlan
      }
    });

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to generate code." 
    }, { status: 500 });
  }
}
