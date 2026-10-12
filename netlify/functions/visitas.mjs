// Contador público de visitantes (cada aparelho conta uma vez), guardado no Netlify Blobs.
// Para zerar: abra /api/visitas?zerar=SUA_SENHA, com a senha cadastrada na variável ADMIN_TOKEN do Netlify.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "ghosty-visitas", consistency: "strong" });
  const zerar = new URL(req.url).searchParams.get("zerar");
  if (zerar && process.env.ADMIN_TOKEN && zerar === process.env.ADMIN_TOKEN) await store.set("total", "0");
  let total = Number(await store.get("total")) || 0;
  if (req.method === "POST") { total += 1; await store.set("total", String(total)); }
  return new Response(JSON.stringify({ total }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};

export const config = {
  path: "/api/visitas",
  method: ["GET", "POST"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
