import { getDb } from "../../../db";
import { bookings } from "../../../db/schema";

export async function POST(request: Request) {
  const data = await request.json();
  if (
    data.fulfillment === "delivery" &&
    (!String(data.address || "").trim() ||
      !String(data.city || "").trim() ||
      data.state !== "GA" ||
      !/^\d{5}$/.test(String(data.zip || "")))
  )
    return Response.json(
      { error: "A complete Georgia delivery address is required." },
      { status: 400 },
    );
  const phrase = String(data.phrase || "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .trim();
  const letters = phrase.replaceAll(" ", "");
  if (!letters || !data.eventDate || !data.customerName || !data.email)
    return Response.json(
      { error: "Missing required information" },
      { status: 400 },
    );
  const counts: Record<string, number> = {};
  for (const letter of letters) counts[letter] = (counts[letter] || 0) + 1;
  if (Object.values(counts).some((count) => count > 2))
    return Response.json(
      { error: "Letter inventory exceeded" },
      { status: 400 },
    );
  const subtotal = letters.length * 55;
  const rental = subtotal - (letters.length >= 4 ? subtotal * 0.1 : 0);
  const delivery = data.fulfillment === "delivery" ? 75 : 0;
  const access =
    data.fulfillment === "delivery" &&
    data.floor === "no" &&
    data.elevator === "yes"
      ? 25
      : 0;
  const id = `MLE-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const db = await getDb();
  await db.insert(bookings).values({
    id,
    createdAt: new Date().toISOString(),
    eventDate: data.eventDate,
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    phrase,
    service: `${letters.length} × 4-ft marquee letters`,
    fulfillment: data.fulfillment || "pickup",
    address: data.address || null,
    address2: data.address2 || null,
    city: data.city || null,
    state: data.state || null,
    zip: data.zip || null,
    deliveryMiles: null,
    deliveryFee: delivery || null,
    floor: data.floor || null,
    elevator: data.elevator || null,
    customerName: data.customerName,
    email: data.email,
    phone: data.phone || null,
    eventType: data.eventType || null,
    venue: data.venue || null,
    displayLocation: data.displayLocation || null,
    notes: data.notes || null,
    total: rental + delivery + access,
    amountPaid: 0,
    paymentStatus: "Unpaid",
    status: "New request",
    letterCount: letters.length,
  });
  return Response.json({ id });
}
