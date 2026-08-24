type BookingData = Record<string, unknown>;

type CrmWebhookInput = {
  stage: "lead_created" | "checkout_started" | "booking_paid";
  eventId: string;
  draftId?: string | null;
  bookingId?: string | null;
  data: BookingData;
  total?: number | null;
  paymentStatus?: string | null;
  test?: boolean;
};

function nameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "",
    lastName: parts.join(" "),
  };
}

export async function sendCrmWebhook(input: CrmWebhookInput) {
  const webhookUrl = process.env.GHL_BOOKING_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn("GHL booking webhook is not configured");
    return { delivered: false, skipped: true };
  }

  const fullName = String(
    input.data.customerName || input.data.customer_name || "",
  ).trim();
  const { firstName, lastName } = nameParts(fullName);
  const attribution =
    input.data.attribution && typeof input.data.attribution === "object"
      ? input.data.attribution
      : {};
  const payload = {
    event_type: input.stage,
    lifecycle_stage:
      input.stage === "lead_created"
        ? "Lead"
        : input.stage === "checkout_started"
          ? "Checkout Started"
          : "Customer / Paid Booking",
    event_id: input.eventId,
    event_timestamp: new Date().toISOString(),
    test: Boolean(input.test),
    source: "MARQuees Lights & Events website",
    source_system: "atlantamarqueeletters.com",
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: String(input.data.email || ""),
    phone: String(input.data.phone || ""),
    draft_id: input.draftId || "",
    booking_id: input.bookingId || "",
    payment_status: input.paymentStatus || "",
    amount: Number(input.total || 0),
    currency: "USD",
    phrase: String(input.data.phrase || ""),
    event_date: String(input.data.eventDate || input.data.event_date || ""),
    start_time: String(input.data.startTime || input.data.start_time || ""),
    end_time: String(input.data.endTime || input.data.end_time || ""),
    event_type_name: String(input.data.eventType || input.data.event_type || ""),
    fulfillment: String(input.data.fulfillment || ""),
    venue: String(input.data.venue || ""),
    display_location: String(
      input.data.displayLocation || input.data.display_location || "",
    ),
    address: String(input.data.address || ""),
    address_2: String(input.data.address2 || input.data.address_2 || ""),
    city: String(input.data.city || ""),
    state: String(input.data.state || ""),
    zip: String(input.data.zip || ""),
    notes: String(input.data.notes || ""),
    attribution,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(`GHL webhook returned ${response.status}`);
    return { delivered: true, skipped: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifyCrm(input: CrmWebhookInput) {
  try {
    return await sendCrmWebhook(input);
  } catch (error) {
    console.error("GHL webhook delivery failed", error);
    return { delivered: false, skipped: false };
  }
}
