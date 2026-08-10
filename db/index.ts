let postgresDb: unknown;

async function getPostgresDb(databaseUrl: string) {
  if (postgresDb) return postgresDb;
  const [{ default: postgres }, { drizzle: postgresDrizzle }] = await Promise.all([
    import("postgres"),
    import("drizzle-orm/postgres-js"),
  ]);
  const client = postgres(databaseUrl, { ssl: "require", max: 4, prepare: false });
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS bookings (
      id text PRIMARY KEY,
      created_at text NOT NULL,
      event_date text NOT NULL,
      start_time text NOT NULL,
      end_time text NOT NULL,
      phrase text NOT NULL,
      service text NOT NULL,
      fulfillment text NOT NULL,
      address text,
      address_2 text,
      city text,
      state text,
      zip text,
      delivery_miles double precision,
      delivery_fee double precision,
      floor text,
      elevator text,
      customer_name text NOT NULL,
      email text NOT NULL,
      phone text,
      event_type text,
      venue text,
      display_location text,
      notes text,
      total double precision NOT NULL,
      amount_paid double precision NOT NULL DEFAULT 0,
      payment_status text NOT NULL DEFAULT 'Unpaid',
      status text NOT NULL DEFAULT 'New request',
      letter_count integer NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stripe_settings (
      id text PRIMARY KEY,
      active_mode text NOT NULL DEFAULT 'test',
      test_publishable_key text,
      test_secret_key_encrypted text,
      test_webhook_secret_encrypted text,
      live_publishable_key text,
      live_secret_key_encrypted text,
      live_webhook_secret_encrypted text,
      updated_at text NOT NULL
    );
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address text;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address_2 text;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city text;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS state text;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_miles double precision;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee double precision;
  `);
  postgresDb = postgresDrizzle(client) as unknown;
  return postgresDb;
}

export async function getDb() {
  if (process.env.DATABASE_URL) return getPostgresDb(process.env.DATABASE_URL) as any;
  throw new Error("PostgreSQL is not configured. Set DATABASE_URL to the Railway Postgres service reference.");
}
