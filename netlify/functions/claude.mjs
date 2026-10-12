// Análise com o Claude. A chave fica só aqui no servidor (variável ANTHROPIC_API_KEY).
const MODEL = {
  default: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
  quick: process.env.CLAUDE_MODEL_QUICK || "claude-haiku-5-5",
};
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "sem_chave" }, 500);
  let body;
  try { body = await req.json(); } catch { return json({ error: "json" }, 400); }
  const { messages = [], images = [], tier = "default" } = body || {};
  if (!Array.isArray(messages) || !messages.length || JSON.stringify(messages).length > 200000) return json({ error: "dados" }, 400);
  const msgs = messages.slice(-12).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "") }));
  const imgs = (Array.isArray(images) ? images : []).slice(0, 6)
    .filter(i => /^image\/(png|jpeg|webp)$/.test(i.media_type) && typeof i.data === "string")
    .map(i => ({ type: "image", source: { type: "base64", media_type: i.media_type, data: i.data } }));
  const last = msgs[msgs.length - 1];
  last.content = [...imgs, { type: "text", text: last.content }];

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL[tier] || MODEL.default, max_tokens: 4500, messages: msgs }),
  });
  const d = await r.json();
  if (!r.ok) {
    console.error("anthropic", r.status, JSON.stringify(d));
    const t = d?.error?.type || "", m = String(d?.error?.message || "");
    const code = t === "authentication_error" || t === "permission_error" ? "chave_invalida"
      : /credit|billing|balance/i.test(m) ? "sem_credito"
      : t === "not_found_error" ? "modelo"
      : t === "overloaded_error" || r.status === 529 ? "ocupado"
      : t === "rate_limit_error" ? "limite"
      : "falha";
    return json({ error: code }, 502);
  }
  return json({ text: (d.content || []).filter(c => c.type === "text").map(c => c.text).join("") });
};

export const config = {
  path: "/api/claude",
  method: "POST",
  // até 20 chamadas por hora por IP, para ninguém gastar seus créditos de IA
  rateLimit: { windowLimit: 20, windowSize: 3600, aggregateBy: ["ip", "domain"] },
};
