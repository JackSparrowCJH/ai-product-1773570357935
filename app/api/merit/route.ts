export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") || "anonymous";

  const store = (globalThis as any).__meritStore || {};
  const merit = store[userId] || 0;

  return Response.json({
    userId,
    merit,
    formatted: formatMerit(merit),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const userId = body.userId || "anonymous";
  const taps = typeof body.taps === "number" && body.taps > 0 ? Math.floor(body.taps) : 1;

  if (!(globalThis as any).__meritStore) {
    (globalThis as any).__meritStore = {};
  }
  const store = (globalThis as any).__meritStore;
  store[userId] = (store[userId] || 0) + taps;
  const merit = store[userId];

  return Response.json({
    userId,
    merit,
    taps,
    formatted: formatMerit(merit),
  });
}

function formatMerit(n: number): string {
  if (n >= 1_0000_0000) return (n / 1_0000_0000).toFixed(1) + "亿";
  if (n >= 1_0000) return (n / 1_0000).toFixed(1) + "万";
  return n.toLocaleString("zh-CN");
}
