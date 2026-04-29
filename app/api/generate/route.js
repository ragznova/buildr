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
    const { prompt, layoutDesc } = body;

    const masterPrompt = `
      Return ONLY a complete, single-file HTML website.
      
      STRICT RULES:
      - Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
      - Use Lucide Icons or FontAwesome via CDN if needed.
      - NO React. NO JSX. NO imports. NO markdown backticks.
      - Start directly with <!DOCTYPE html>
      - Make it a professional, ₹50,000-quality unique website.
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

    console.log(`[SIMPLE ENGINE] Generating HTML for: ${prompt}`);

    let htmlOutput = "";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(masterPrompt);
      htmlOutput = result.response.text();
    } catch (err) {
      console.log("[FALLBACK] Using Groq Llama 3.3...");
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: "user", content: masterPrompt }],
        model: "llama-3.3-70b-versatile",
      });
      htmlOutput = groqResponse.choices[0].message.content;
    }

    // Final cleanup to ensure no markdown backticks
    htmlOutput = htmlOutput.replace(/```html/g, "").replace(/```/g, "").trim();

    return NextResponse.json({ success: true, html: htmlOutput });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
