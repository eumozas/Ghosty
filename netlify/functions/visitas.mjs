// Contador público de visitas, guardado no Netlify Blobs.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore({ name: "ghosty-visitas", consistency: "strong" });
  let total = Number(await store.get("total")) || 0;
  if (req.method === "POST") { total += 1; await store.set("total", String(total)); }
  return new Response(JSON.stringify({ total }), { headers: { "content-type": "application/json", "cache-control": "no-store" } });
};

export const config = {
  path: "/api/visitas",
  method: ["GET", "POST"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
