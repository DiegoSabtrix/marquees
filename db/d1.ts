import { env } from "cloudflare:workers";

const schema = [
  `CREATE TABLE IF NOT EXISTS bookings (id text PRIMARY KEY, created_at text NOT NULL, event_date text NOT NULL, start_time text NOT NULL, end_time text NOT NULL, phrase text NOT NULL, service text NOT NULL, fulfillment text NOT NULL, address text, address_2 text, city text, state text, zip text, delivery_miles real, delivery_fee real, floor text, elevator text, customer_name text NOT NULL, email text NOT NULL, phone text, event_type text, venue text, display_location text, notes text, total real NOT NULL, amount_paid real NOT NULL DEFAULT 0, payment_status text NOT NULL DEFAULT 'Unpaid', status text NOT NULL DEFAULT 'New request', letter_count integer NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS stripe_settings (id text PRIMARY KEY, active_mode text NOT NULL DEFAULT 'test', test_publishable_key text, test_secret_key_encrypted text, test_webhook_secret_encrypted text, live_publishable_key text, live_secret_key_encrypted text, live_webhook_secret_encrypted text, updated_at text NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS booking_drafts (id text PRIMARY KEY, created_at text NOT NULL, updated_at text NOT NULL, current_step integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'In progress', email text, customer_name text, total real NOT NULL DEFAULT 0, data text NOT NULL, booking_id text)`,
  `CREATE TABLE IF NOT EXISTS payment_attempts (id text PRIMARY KEY, booking_id text NOT NULL, draft_id text, stripe_session_id text, mode text NOT NULL, amount real NOT NULL, status text NOT NULL, error text, created_at text NOT NULL, updated_at text NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS booking_drafts_updated_idx ON booking_drafts(updated_at DESC)`,
  `CREATE INDEX IF NOT EXISTS payment_attempts_booking_idx ON payment_attempts(booking_id)`,
];

let ready: Promise<void> | null = null;

async function initialize() {
  if (!env.DB) throw new Error("The Sites D1 database binding DB is unavailable.");
  if (!ready) ready = env.DB.batch(schema.map((sql) => env.DB.prepare(sql))).then(() => undefined).catch((error) => {
    ready = null;
    throw error;
  });
  await ready;
}

export async function d1Query<T extends Record<string, unknown>>(sql: string, values: unknown[] = []) {
  await initialize();
  const statement = env.DB.prepare(sql).bind(...values);
  const result = await statement.all<T>();
  return result.results || [];
}

export async function d1Execute(sql: string, values: unknown[] = []) {
  await initialize();
  return env.DB.prepare(sql).bind(...values).run();
}
