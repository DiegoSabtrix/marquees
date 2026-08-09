import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { bookings } from "../../../../db/schema";
import { cookieToken, validAdminToken } from "../../../../lib/admin-auth";

export async function GET(request: Request) {
  if (!await validAdminToken(cookieToken(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  return Response.json(await db.select().from(bookings).orderBy(desc(bookings.createdAt)));
}

export async function PATCH(request: Request) {
  if (!await validAdminToken(cookieToken(request))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await request.json();
  const allowed = ["New request", "In service", "Ready for pickup", "Picked up", "Completed", "Cancelled"];
  if (!id || !allowed.includes(status)) return Response.json({ error: "Invalid update" }, { status: 400 });
  const db = await getDb();
  await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  return Response.json({ ok: true });
}
