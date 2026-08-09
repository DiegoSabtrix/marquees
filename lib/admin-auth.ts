const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function signature(payload: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(process.env.ADMIN_SESSION_SECRET || ""), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}

export async function createAdminToken() {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({ sub: "admin", exp: Date.now() + 8 * 60 * 60 * 1000 })));
  return `${payload}.${await signature(payload)}`;
}

export async function validAdminToken(token?: string) {
  if (!token) return false;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied || supplied !== await signature(payload)) return false;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), c => c.charCodeAt(0))));
    return decoded.sub === "admin" && decoded.exp > Date.now();
  } catch { return false; }
}

export function adminCredentialsValid(username: string, password: string) {
  return username === (process.env.ADMIN_USERNAME || "admin2026") && password === process.env.ADMIN_PASSWORD;
}

export function cookieToken(request: Request) {
  return request.headers.get("cookie")?.match(/(?:^|; )marquees_admin=([^;]+)/)?.[1];
}
