// (Opcional) Pix automático pela API do Mercado Pago. Só é usado se window.GHOSTY_AUTOPIX=true no index.html.
import { randomUUID } from "node:crypto";
const PLANS = { 1: { name: "Essencial", amount: "19.90" }, 2: { name: "Pro", amount: "29.90" }, 3: { name: "Completo", amount: "49.90" } };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  const { plan, email } = await req.json().catch(() => ({}));
  const p = PLANS[Number(plan)];
  if (!p || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ""))) return json({ error: "dados inválidos" }, 400);
  const r = await fetch("https://api.mercadopago.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "X-Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      type: "online", processing_mode: "automatic", external_reference: `ghosty-${plan}-${Date.now()}`,
      total_amount: p.amount, description: `Ghosty - plano ${p.name}`, payer: { email },
      transactions: { payments: [{ amount: p.amount, payment_method: { id: "pix", type: "bank_transfer" }, expiration_time: "PT30M" }] },
    }),
  });
  const d = await r.json();
  if (!r.ok) { console.error("mercado pago", d); return json({ error: "não foi possível gerar o Pix" }, 502); }
  const pm = d.transactions?.payments?.[0]?.payment_method || {};
  return json({ id: d.id, qr_code: pm.qr_code, qr_base64: pm.qr_code_base64 });
};
export const config = { path: "/api/pix", method: "POST" };
