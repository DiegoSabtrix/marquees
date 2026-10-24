import { getDb } from "../../../db";
import { bookings } from "../../../db/schema";
import { calculateBookingItems, selectionCountLabel, selectionName } from "../../../lib/booking-items";

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
  const items = calculateBookingItems(data.phrase, data.selectedSymbols);
  const phrase = items.phrase.trim();
  if (!items.totalItems || !data.eventDate || !data.customerName || !data.email)
    return Response.json(
      { error: "Missing required information" },
      { status: 400 },
    );
  if (items.shortage)
    return Response.json(
      { error: "Letter inventory exceeded" },
      { status: 400 },
    );
  const rental = items.rental;
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
    service: `${selectionName(phrase, items.selectedSymbols)} · ${selectionCountLabel(items.letterCount, items.symbolCount)}`,
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
    letterCount: items.letterCount,
    selectedSymbols: JSON.stringify(items.selectedSymbols),
    symbolCount: items.symbolCount,
    totalItems: items.totalItems,
  });
  return Response.json({ id });
}
