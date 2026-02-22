export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = "PASTE_FULL_KEY_HERE";

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch(e) { return res.status(400).json({error: e.message}); } }
  if (!body || !body.model) return res.status(400).json({ error: "Missing body" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body)
    });
    const txt = await r.text();
    let data; try { data = JSON.parse(txt); } catch(_) { return res.status(500).json({error: txt.slice(0,300)}); }
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || JSON.stringify(data) });
    return res.status(200).json(data);
  } catch(err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}