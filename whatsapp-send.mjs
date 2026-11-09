export default async (req) => {
  if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  // Protect this endpoint before production use. Do not expose it as an unrestricted public send API.
  const internalSecret = process.env.WHATSAPP_SEND_SECRET;
  if (!internalSecret || req.headers.get("x-internal-secret") !== internalSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try { body = await req.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const to = String(body.to || "").replace(/\D/g, "");
  const message = String(body.message || "").trim().slice(0, 4000);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!to || !message) return Response.json({ error: "Recipient and message are required" }, { status: 400 });
  if (!token || !phoneNumberId) return Response.json({ error: "WhatsApp API is not configured" }, { status: 503 });

  const response = await fetch(`https://graph.facebook.com/vXX.X/${phoneNumberId}/messages`, {
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
  if (!response.ok) {
    console.error("WhatsApp send error:", data);
    return Response.json({ error: "WhatsApp message failed", details: data }, { status: response.status });
  }
  return Response.json({ ok: true, data });
};
