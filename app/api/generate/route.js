import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// AI Router Config
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, activeTab, canvasData, files, url, language, layoutDesc, userPlan = "free" } = body;

    // FIX 2 — STRONG MASTER PROMPT
    const masterPrompt = `
      You are BUILDR AI, the world's best website generator. 
      Your mission is to generate a premium, high-converting website component.

      [CANVAS_DESCRIPTION]
      ${layoutDesc}

      User's additional instructions: 
      "${prompt || "Generate a creative high-end design"}"

      Business type detected: ${prompt || "General Premium"}
      Preferred language: ${language || "English"}
      Tech stack: React + Tailwind CSS + Lucide Icons + Framer Motion

      GENERATE A COMPLETE, UNIQUE, PRODUCTION-READY website that:
      1. Follows the EXACT layout from drawing described above.
      2. Has real content related to the user's prompt (NOT lorem ipsum).
      3. Uses a beautiful, premium DARK THEME by default.
      4. Is fully mobile responsive and highly interactive.
      5. Has smooth hover effects and micro-animations.
      6. Includes all sections (Header, Hero, Features, Grid, Footer) as drawn.

      STRICT RULES FOR CODE GENERATION:
      1. Use ONLY these libraries for imports:
         - import { useState, useEffect } from 'react'
         - import { motion, AnimatePresence } from 'framer-motion'
         - import { X, Menu, Star, Check, ArrowRight, Github, Twitter, Instagram } from 'lucide-react'
         - import Link from 'next/link'
      
      2. NEVER import or use:
         - lucide-react-native ❌
         - react-router-dom ❌
         - react-icons ❌
         - any library NOT in the list above ❌

      3. COMPONENT STRUCTURE:
         - Every component MUST start with 'use client'
         - MUST export default function Page()
         - Use Tailwind CSS classes ONLY
         - All code must be self-contained in ONE FILE.

      OUTPUT RULES:
      - Return ONLY the raw code.
      - NO markdown code blocks.
      - Make it look like a real ₹50,000 premium website.
    `;

    console.log(`[AI ROUTER] Initializing Multi-Model Generation for ${userPlan}...`);

    let text = "";
    let modelUsed = "";

    // FIX 4 — TRIPLE FALLBACK (NO HARDCODED TEMPLATES)
    try {
      console.log("[TIER 1] Trying Gemini 1.5 Flash...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(masterPrompt);
      const response = await result.response;
      text = response.text();
      modelUsed = "gemini-1.5-flash";
    } catch (err1) {
      console.error("[TIER 1 FAILED] Moving to Groq...", err1.message);
      try {
        console.log("[TIER 2] Trying Groq (Llama 3.3)...");
        const groqResponse = await groq.chat.completions.create({
          messages: [{ role: "user", content: masterPrompt }],
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
        });
        text = groqResponse.choices[0].message.content;
        modelUsed = "groq-llama-3.3";
      } catch (err2) {
        console.error("[TIER 2 FAILED] Moving to OpenAI...", err2.message);
        try {
          console.log("[TIER 3] Trying OpenAI (GPT-4o Mini)...");
          const oaiResponse = await openai.chat.completions.create({
            messages: [{ role: "user", content: masterPrompt }],
            model: "gpt-4o-mini",
            temperature: 0.2,
          });
          text = oaiResponse.choices[0].message.content;
          modelUsed = "openai-gpt-4o-mini";
        } catch (err3) {
          console.error("[ALL TIERS FAILED] No backup remaining.");
          throw new Error("AI Generation failed across all redundant models. Please check your API keys or quota.");
        }
      }
    }

    // Post-generation cleanup
    text = text.replace(/```javascript/g, "")
               .replace(/```jsx/g, "")
               .replace(/```/g, "")
               .replace(/import React from 'react';/i, "import React from 'react';")
               .trim();

    return NextResponse.json({ 
      success: true, 
      code: text,
      modelUsed: modelUsed,
      metadata: { timestamp: new Date().toISOString() }
    });

  } catch (error) {
    console.error("Critical AI Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
