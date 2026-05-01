import { fallbackTemplates } from './templates';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    console.log("[BUILDR AI] Generating for:", prompt);

    // Try Gemini 1.5 Flash (free tier)
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a world-class website builder AI.
Generate a complete, beautiful, production-ready website.
User wants: ${prompt}

Return ONLY a complete HTML file. No markdown. No explanation.
Start with <!DOCTYPE html> and end with </html>.

Rules:
- Include <script src="https://cdn.tailwindcss.com"></script> in head
- Dark theme (bg-gray-900/bg-black text-white)
- Beautiful gradients, shadows, modern design
- Mobile responsive
- Real content based on the prompt (NO lorem ipsum)
- Include: navigation bar, hero section with CTA, features/services grid, testimonials, footer
- Use professional spacing and typography
- Add subtle hover effects with Tailwind
- Make it look like a $10,000 agency website`
            }]
          }],
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let html = data.candidates[0].content.parts[0].text;
      html = html.replace(/```html/g, '').replace(/```/g, '').trim();
      
      if (html.includes('<!DOCTYPE') || html.includes('<html')) {
        console.log("[BUILDR AI] Gemini success ✅");
        return Response.json({ success: true, html });
      }
    }

    // Fallback to pre-built template
    console.log("[BUILDR AI] Gemini failed, using fallback template");
    return Response.json({ 
      success: true, 
      html: pickTemplate(prompt) 
    });

  } catch (error) {
    console.error("[BUILDR AI] Error:", error.message);
    // Always succeed for prototype - use fallback
    const { prompt } = await req.clone().json().catch(() => ({ prompt: '' }));
    return Response.json({ 
      success: true, 
      html: pickTemplate(prompt || 'business') 
    });
  }
}

function pickTemplate(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('coffee') || p.includes('cafe') || p.includes('brew') || p.includes('restaurant') || p.includes('food')) return fallbackTemplates.coffee;
  if (p.includes('gym') || p.includes('fitness') || p.includes('health') || p.includes('sport')) return fallbackTemplates.fitness;
  if (p.includes('agency') || p.includes('studio') || p.includes('creative') || p.includes('design')) return fallbackTemplates.agency;
  if (p.includes('shop') || p.includes('store') || p.includes('ecommerce') || p.includes('product')) return fallbackTemplates.ecommerce;
  return fallbackTemplates.saas;
}
