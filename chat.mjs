const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

const languageNames = {
  ta: "Tamil",
  te: "Telugu",
  en: "English"
};

export default async (req) => {
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders }); }

  const message = String(body.message || "").trim().slice(0, 4000);
  const language = ["ta", "te", "en"].includes(body.language) ? body.language : "en";
  if (!message) return Response.json({ error: "Message is required" }, { status: 400, headers: corsHeaders });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const fallback = {
      ta: "வணக்கம்! RDP CREATE-ஐ தொடர்புகொண்டதற்கு நன்றி. உங்கள் தேவையைச் சொல்லுங்கள்; எங்கள் குழு உதவும்.",
      te: "నమస్కారం! RDP CREATE ను సంప్రదించినందుకు ధన్యవాదాలు. మీ అవసరాన్ని తెలియజేయండి; మా బృందం సహాయం చేస్తుంది.",
      en: "Hello! Thanks for contacting RDP CREATE. Please share what you need and our team will help."
    };
    return Response.json({ reply: fallback[language], demo: true }, { headers: corsHeaders });
  }

  const model = process.env.OPENAI_MODEL;
  if (!model) return Response.json({ error: "Set OPENAI_MODEL in Netlify environment variables." }, { status: 500, headers: corsHeaders });

  const systemPrompt = `You are the customer-support AI assistant for RDP CREATE, a creative and digital service business.
Reply in ${languageNames[language]}. If a user explicitly requests another supported language, follow that request.
Be warm, concise, and clear. Help with service enquiries, booking enquiries, order status questions, and video/design delivery questions.
Never invent prices, availability, order status, payment confirmation, delivery promises, or business contact details. If information is missing, ask one short follow-up question or say that the RDP CREATE team must confirm it.
Do not claim to have actually created a booking, accepted payment, or sent a WhatsApp message unless a connected system confirms it. Do not request passwords, OTPs, or full payment card details.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: message,
        max_output_tokens: 450
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data?.error?.message || response.status);
      return Response.json({ error: "AI service is temporarily unavailable." }, { status: 502, headers: corsHeaders });
    }
    const reply = data.output_text || "Sorry, please contact the RDP CREATE team for help.";
    return Response.json({ reply }, { headers: corsHeaders });
  } catch (err) {
    console.error("Chat function error:", err);
    return Response.json({ error: "Unable to connect to AI service." }, { status: 500, headers: corsHeaders });
  }
};
