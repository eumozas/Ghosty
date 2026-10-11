// (Opcional) Confere se o Pix automático foi pago.
const PLANS = { 1: "19.90", 2: "29.90", 3: "49.90" };
export default async (req) => {
  const id = new URL(req.url).searchParams.get("id") || "";
  const out = o => new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return out({ paid: false });
  const r = await fetch(`https://api.mercadopago.com/v1/orders/${id}`, { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } });
  if (!r.ok) return out({ paid: false });
  const d = await r.json();
  const level = Number(String(d.external_reference || "").split("-")[1]);
  const pay = d.transactions?.payments?.[0] || {};
  const paid = d.status === "processed" || pay.status === "processed" || pay.status_detail === "accredited";
  const ok = PLANS[level] && Number(d.total_amount) >= Number(PLANS[level]);
  return out({ paid: Boolean(paid && ok), level: ok ? level : 0 });
};
export const config = { path: "/api/status" };
