import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { stripeSettings } from "../../../../db/schema";
import { cookieToken, validAdminToken } from "../../../../lib/admin-auth";
import { encryptStripeSecret, secretSummary } from "../../../../lib/stripe-settings";

const SETTINGS_ID = "primary";
type Mode = "test" | "live";

async function authorized(request: Request) {
  return validAdminToken(cookieToken(request));
}

export async function GET(request: Request) {
  if (!await authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const [settings] = await db.select().from(stripeSettings).where(eq(stripeSettings.id, SETTINGS_ID));
  const [testSecret, testWebhook, liveSecret, liveWebhook] = await Promise.all([
    secretSummary(settings?.testSecretKeyEncrypted ?? null),
    secretSummary(settings?.testWebhookSecretEncrypted ?? null),
    secretSummary(settings?.liveSecretKeyEncrypted ?? null),
    secretSummary(settings?.liveWebhookSecretEncrypted ?? null),
  ]);
  return Response.json({
    activeMode: settings?.activeMode ?? "test",
    testPublishableKey: settings?.testPublishableKey ?? "",
    livePublishableKey: settings?.livePublishableKey ?? "",
    testSecret,
    testWebhook,
    liveSecret,
    liveWebhook,
    updatedAt: settings?.updatedAt ?? null,
  });
}

export async function PUT(request: Request) {
  if (!await authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, string>;
  const activeMode = body.activeMode as Mode;
  if (!(["test", "live"] as Mode[]).includes(activeMode)) return Response.json({ error: "Invalid Stripe mode" }, { status: 400 });

  const db = await getDb();
  const [existing] = await db.select().from(stripeSettings).where(eq(stripeSettings.id, SETTINGS_ID));
  const testPublishableKey = body.testPublishableKey?.trim() || existing?.testPublishableKey || null;
  const livePublishableKey = body.livePublishableKey?.trim() || existing?.livePublishableKey || null;
  if (testPublishableKey && !testPublishableKey.startsWith("pk_test_")) return Response.json({ error: "The test publishable key must start with pk_test_" }, { status: 400 });
  if (livePublishableKey && !livePublishableKey.startsWith("pk_live_")) return Response.json({ error: "The live publishable key must start with pk_live_" }, { status: 400 });
  if (body.testSecretKey && !body.testSecretKey.startsWith("sk_test_")) return Response.json({ error: "The test secret key must start with sk_test_" }, { status: 400 });
  if (body.liveSecretKey && !body.liveSecretKey.startsWith("sk_live_")) return Response.json({ error: "The live secret key must start with sk_live_" }, { status: 400 });
  if (body.testWebhookSecret && !body.testWebhookSecret.startsWith("whsec_")) return Response.json({ error: "The test webhook secret must start with whsec_" }, { status: 400 });
  if (body.liveWebhookSecret && !body.liveWebhookSecret.startsWith("whsec_")) return Response.json({ error: "The live webhook secret must start with whsec_" }, { status: 400 });

  const testSecretKeyEncrypted = body.testSecretKey ? await encryptStripeSecret(body.testSecretKey) : existing?.testSecretKeyEncrypted ?? null;
  const testWebhookSecretEncrypted = body.testWebhookSecret ? await encryptStripeSecret(body.testWebhookSecret) : existing?.testWebhookSecretEncrypted ?? null;
  const liveSecretKeyEncrypted = body.liveSecretKey ? await encryptStripeSecret(body.liveSecretKey) : existing?.liveSecretKeyEncrypted ?? null;
  const liveWebhookSecretEncrypted = body.liveWebhookSecret ? await encryptStripeSecret(body.liveWebhookSecret) : existing?.liveWebhookSecretEncrypted ?? null;
  if (activeMode === "live" && (!livePublishableKey || !liveSecretKeyEncrypted)) {
    return Response.json({ error: "Add both live Stripe keys before activating Production" }, { status: 400 });
  }

  const values = {
    id: SETTINGS_ID,
    activeMode,
    testPublishableKey,
    testSecretKeyEncrypted,
    testWebhookSecretEncrypted,
    livePublishableKey,
    liveSecretKeyEncrypted,
    liveWebhookSecretEncrypted,
    updatedAt: new Date().toISOString(),
  };
  await db.insert(stripeSettings).values(values).onConflictDoUpdate({ target: stripeSettings.id, set: values });
  return Response.json({ ok: true });
}
