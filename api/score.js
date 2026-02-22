export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // API key comes ONLY from Vercel environment variable - never from client
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "ANTHROPIC_API_KEY environment variable not set in Vercel dashboard" 
    });
  }

  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    if (!body) return res.status(400).json({ error: "Empty request body" });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    try {
      return res.status(response.status).json(JSON.parse(text));
    } catch {
      return res.status(500).json({ error: "Non-JSON from Anthropic: " + text.slice(0, 300) });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}