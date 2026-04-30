import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
})

export async function POST(req) {
  try {
    const { prompt } = await req.json()
    
    console.log("[AI SERVER] Generation started for:", prompt);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: `You are a website builder.
Always return a complete HTML website.
Use Tailwind CSS CDN for styling.
Return ONLY HTML. No explanation.
Start with <!DOCTYPE html>`
      }, {
        role: "user", 
        content: `Build a website for: ${prompt}
        
Make it beautiful, dark theme, 
professional. Real content only.
No lorem ipsum.`
      }],
      max_tokens: 3500
    })
    
    let html = completion.choices[0].message.content;
    
    // Cleanup AI markers
    html = html.replace(/```html/g,'')
               .replace(/```/g,'')
               .trim()
    
    console.log("[AI SERVER] Generation complete ✅");
    
    return Response.json({ 
      success: true, 
      html: html 
    })
    
  } catch (error) {
    console.error("[AI SERVER] Critical Error:", error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    })
  }
}
