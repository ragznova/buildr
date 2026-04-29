import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// AI Router Config
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, activeTab, canvasData, url, language, layoutDesc, userPlan = "free" } = body;

    const masterPrompt = `
      You are BUILDR AI, the world's best website generator. 
      The user wants a premium website based on this layout:
      [CANVAS_DESCRIPTION]
      ${layoutDesc}

      User Intent: "${prompt || "A luxury modern website"}"
      Language: ${language}

      STRICT OUTPUT FORMAT:
      You must return a JSON object with two fields: "html" and "jsx".
      
      FIELD 1: "html"
      - A complete, self-contained <!DOCTYPE html> file.
      - Use <script src="https://cdn.tailwindcss.com"></script> for styling.
      - Include Lucide icons via CDN if needed.
      - Use <script src="https://unpkg.com/framer-motion/dist/framer-motion.js"></script> for animations.
      - This must be a STUNNING, unique website based on the user's sketch.
      - Include real content related to "${prompt}".

      FIELD 2: "jsx"
      - The same website but written as a Next.js React component.
      - import { motion } from 'framer-motion';
      - import { Star, Check, ArrowRight } from 'lucide-react';
      - Use 'use client'; and export default function Page().

      RULES:
      - NO markdown formatting.
      - NO explanations.
      - Return ONLY the raw JSON object.
    `;

    console.log(`[AI ROUTER] Generating Dual-Format Preview for ${userPlan}...`);

    let resultText = "";
    let modelUsed = "";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(masterPrompt);
      resultText = result.response.text();
      modelUsed = "gemini-1.5-flash";
    } catch (err) {
      console.error("[TIER 1 FAILED] Falling back to Groq...");
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: "user", content: masterPrompt }],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      resultText = groqResponse.choices[0].message.content;
      modelUsed = "groq-llama-3.3";
    }

    // Parse JSON safely
    let finalData;
    try {
      // Strip potential markdown backticks if AI ignored instructions
      const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      finalData = JSON.parse(cleanedText);
    } catch (e) {
      console.error("JSON Parse Error, returning raw text as fallback");
      finalData = { html: resultText, jsx: resultText };
    }

    return NextResponse.json({ 
      success: true, 
      html: finalData.html,
      jsx: finalData.jsx,
      modelUsed: modelUsed
    });

  } catch (error) {
    console.error("Critical AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
