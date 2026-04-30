export async function POST(req) {
  try {
    const { prompt } = await req.json();
    
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + 
      process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a website builder AI.
Generate a complete beautiful website.
User wants: ${prompt}

Return ONLY this exact format - a complete HTML file:
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<title>Website</title>
</head>
<body class="bg-gray-900 text-white">
[YOUR COMPLETE WEBSITE HERE]
</body>
</html>

Rules:
- Real content based on prompt
- Beautiful dark design
- Mobile responsive
- No placeholder text
- No lorem ipsum
- No React
- No imports
- Pure HTML + Tailwind only`
            }]
          }]
        })
      }
    );
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]) {
      throw new Error("AI failed to generate content");
    }

    const html = data.candidates[0].content.parts[0].text;
      
    // Clean the HTML
    const cleanHtml = html
      .replace(/```html/g, '')
      .replace(/```/g, '')
      .trim();
    
    return Response.json({ html: cleanHtml });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
