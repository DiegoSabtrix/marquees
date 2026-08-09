import { adminCredentialsValid, createAdminToken } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const { username = "", password = "" } = await request.json();
  if (!adminCredentialsValid(username, password)) return Response.json({ error: "Invalid username or password" }, { status: 401 });
  const token = await createAdminToken();
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `marquees_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800` } });
}
