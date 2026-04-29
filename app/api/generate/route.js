import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

// Server-side AI Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Firebase Server-Side Init (Using Client SDK for simplicity)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, layoutDesc, projectId } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: "Project ID is missing" }, { status: 400 });
    }

    const masterPrompt = `
      Return ONLY a complete, single-file HTML website.
      
      STRICT RULES:
      - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
      - NO React. NO JSX. NO imports. NO markdown backticks.
      - Start directly with <!DOCTYPE html>
      - Content must be specific to: "${prompt}"
      - Follow this layout blueprint: ${layoutDesc}

      Structure:
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>${prompt}</title>
      </head>
      <body class="bg-black text-white">
        <!-- AI generates STUNNING unique content here -->
      </body>
      </html>
    `;

    console.log("[AI SERVER] Request received for project:", projectId);

    let htmlOutput = "";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(masterPrompt);
      htmlOutput = result.response.text();
    } catch (err) {
      console.log("[AI SERVER] Gemini Fallback to Groq...");
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: "user", content: masterPrompt }],
        model: "llama-3.3-70b-versatile",
      });
      htmlOutput = groqResponse.choices[0].message.content;
    }

    // Cleanup
    htmlOutput = htmlOutput.replace(/```html/g, "").replace(/```/g, "").trim();

    // SERVER-SIDE SAVE
    console.log("[AI SERVER] Saving to database...");
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      generatedHTML: htmlOutput,
      prompt: prompt,
      status: 'generated',
      updatedAt: new Date()
    });

    console.log("[AI SERVER] Generation & Save Complete ✅");

    return NextResponse.json({ success: true, html: htmlOutput });

  } catch (error) {
    console.error("[AI SERVER] Critical Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
