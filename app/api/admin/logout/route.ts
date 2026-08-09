export async function POST() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": "marquees_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0" } });
}
