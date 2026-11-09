async function makeAIReply(message) {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  if (!key || !model) {
    // Safe fallback while AI credentials are not configured.
    return "வணக்கம்! RDP CREATE-ஐ தொடர்புகொண்டதற்கு நன்றி. உங்கள் தேவையைச் சொல்லுங்கள்; எங்கள் குழு உதவும்.";
  }
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      instructions: `You are the customer-support assistant for RDP CREATE, a creative and digital service business.
Detect the language of the customer's message and reply in that same language (Tamil, Telugu, or English).
Be friendly, concise, and helpful. Answer service, booking, order, and delivery questions.
Never invent prices, availability, order status, payment confirmation, or delivery promises. If information is not connected or unknown, say the RDP CREATE team must confirm it.
Never claim a booking or payment has been completed unless a connected trusted system confirms it. Never ask for OTPs, passwords, or card details.`,
      input: message,
      max_output_tokens: 350
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "AI request failed");
  return String(data.output_text || "Thank you for contacting RDP CREATE. Our team will help you shortly.").slice(0, 3500);
}

async function sendWhatsAppReply(to, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_API_VERSION;
  if (!token || !phoneNumberId || !version) throw new Error("WhatsApp API environment variables are not configured");
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { preview_url: false, body: message }
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export default async (req) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Webhook verification failed", { status: 403 });
  }

  if (req.method === "POST") {
    let payload;
    try { payload = await req.json(); }
    catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

    // IMPORTANT: before production, verify X-Hub-Signature-256 with WHATSAPP_APP_SECRET.
    // Ignore delivery-status updates and non-text messages for this starter.
    const tasks = [];
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        for (const msg of change.value?.messages || []) {
          if (msg.type === "text" && msg.from && msg.text?.body) {
            tasks.push({ from: msg.from, text: msg.text.body, id: msg.id });
          }
        }
      }
    }

    // Meta expects a fast 200 response. This simple starter processes messages inline;
    // use a durable queue/background function for high-volume production traffic.
    for (const item of tasks) {
      try {
        const reply = await makeAIReply(item.text);
        await sendWhatsAppReply(item.from, reply);
      } catch (error) {
        console.error("WhatsApp auto-reply failed:", error);
      }
    }
    return Response.json({ received: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
