export async function POST(req) {
  try {
    const { prompt } = await req.json()
    
    console.log("[AI SERVER] Generation started with GROQ for:", prompt);
    
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_GROQ_API_KEY
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: `You are a website builder AI.
Always return a complete HTML website.
Use Tailwind CSS CDN for styling.
Return ONLY HTML code.
No explanation. No markdown.
Start directly with <!DOCTYPE html>
End with </html>`
            },
            {
              role: 'user',
              content: `Build a complete beautiful website for: ${prompt}

Requirements:
- Dark theme background
- Professional design
- Real content (no lorem ipsum)
- Mobile responsive
- Tailwind CSS classes only
- Include: navbar, hero, features, footer`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error("[AI SERVER] Groq Error:", data.error?.message);
      throw new Error(data.error?.message || 'Groq API failed');
    }
    
    let html = data.choices[0].message.content;
    
    // Cleanup AI markers
    html = html.replace(/```html/g, '')
               .replace(/```/g, '')
               .trim();
    
    console.log("[AI SERVER] Groq Generation complete ✅");
    
    return Response.json({ 
      success: true, 
      html: html 
    })
    
  } catch (error) {
    console.error("[AI SERVER] Critical Error:", error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
