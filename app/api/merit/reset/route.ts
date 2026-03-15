export async function POST(request: Request) {
  const body = await request.json();
  const userId = body.userId || "anonymous";

  if (!(globalThis as any).__meritStore) {
    (globalThis as any).__meritStore = {};
  }
  (globalThis as any).__meritStore[userId] = 0;

  return Response.json({ userId, merit: 0, formatted: "0" });
}
