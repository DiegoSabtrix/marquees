type Row = Record<string, unknown>;
type Database = { kind: "postgres"; client: any } | { kind: "d1" };

let databasePromise: Promise<Database> | null = null;

function databaseUrl() {
  const normalize = (value: string) => {
    const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
    const protocol = Math.max(
      trimmed.indexOf("postgresql://"),
      trimmed.indexOf("postgres://"),
    );
    return protocol >= 0
      ? trimmed.slice(protocol)
      : trimmed.replace(/^DATABASE_(?:PUBLIC_)?URL\s*=\s*/i, "");
  };
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DATABASE_PUBLIC_URL,
    ...Object.values(process.env),
  ];
  for (const candidate of candidates)
    if (candidate && /(?:postgresql|postgres):\/\//.test(candidate))
      return normalize(candidate);
  if (
    process.env.PGHOST &&
    process.env.PGUSER &&
    process.env.PGPASSWORD &&
    process.env.PGDATABASE
  ) {
    const user = encodeURIComponent(process.env.PGUSER),
      password = encodeURIComponent(process.env.PGPASSWORD);
    const port = process.env.PGPORT || "5432";
    return `postgresql://${user}:${password}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }
  return null;
}

function postgresSql(sql: string) {
  let index = 0;
  return sql.replaceAll("?", () => `$${++index}`);
}

async function connect(): Promise<Database> {
  const connectionString = databaseUrl();
  if (connectionString) {
    const { default: postgres } = await import("postgres");
    const client = postgres(connectionString, {
      ssl: "require",
      max: 4,
      prepare: false,
      connect_timeout: 8,
      idle_timeout: 20,
    });
    const statements = [
      `CREATE TABLE IF NOT EXISTS bookings (id text PRIMARY KEY, created_at text NOT NULL, event_date text NOT NULL, start_time text NOT NULL, end_time text NOT NULL, phrase text NOT NULL, service text NOT NULL, fulfillment text NOT NULL, address text, address_2 text, city text, state text, zip text, delivery_miles double precision, delivery_fee double precision, floor text, elevator text, customer_name text NOT NULL, email text NOT NULL, phone text, event_type text, venue text, display_location text, notes text, total double precision NOT NULL, amount_paid double precision NOT NULL DEFAULT 0, payment_status text NOT NULL DEFAULT 'Unpaid', status text NOT NULL DEFAULT 'New request', letter_count integer NOT NULL)`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address text`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address_2 text`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city text`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS state text`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_miles double precision`,
      `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee double precision`,
      `CREATE TABLE IF NOT EXISTS stripe_settings (id text PRIMARY KEY, active_mode text NOT NULL DEFAULT 'test', test_publishable_key text, test_secret_key_encrypted text, test_webhook_secret_encrypted text, live_publishable_key text, live_secret_key_encrypted text, live_webhook_secret_encrypted text, updated_at text NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS booking_drafts (id text PRIMARY KEY, created_at text NOT NULL, updated_at text NOT NULL, current_step integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'In progress', email text, customer_name text, total double precision NOT NULL DEFAULT 0, data text NOT NULL, booking_id text)`,
      `CREATE TABLE IF NOT EXISTS payment_attempts (id text PRIMARY KEY, booking_id text NOT NULL, draft_id text, stripe_session_id text, mode text NOT NULL, amount double precision NOT NULL, status text NOT NULL, error text, created_at text NOT NULL, updated_at text NOT NULL)`,
      `CREATE INDEX IF NOT EXISTS booking_drafts_updated_idx ON booking_drafts(updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS payment_attempts_booking_idx ON payment_attempts(booking_id)`,
    ];
    for (const statement of statements) await client.unsafe(statement);
    return { kind: "postgres", client };
  }
  // Sites provides a D1 binding instead of a PostgreSQL connection string.
  // Keep this import conditional so Railway's Node runtime never evaluates the
  // Cloudflare-only module when DATABASE_URL is configured.
  const { d1Query } = await import("./d1");
  await d1Query(`SELECT 1 AS ready`);
  return { kind: "d1" };
}

async function db() {
  if (!databasePromise)
    databasePromise = connect().catch((error) => {
      databasePromise = null;
      throw error;
    });
  return databasePromise;
}

export function databaseConfig() {
  return {
    configured: true,
    source: process.env.DATABASE_URL
      ? "DATABASE_URL"
      : process.env.DATABASE_PUBLIC_URL
        ? "DATABASE_PUBLIC_URL"
        : process.env.PGHOST
          ? "PG variables"
          : "Sites D1",
  };
}

export async function query<T extends Row = Row>(
  sql: string,
  values: unknown[] = [],
): Promise<T[]> {
  const database = await db();
  if (database.kind === "postgres")
    return (await database.client.unsafe(postgresSql(sql), values)) as T[];
  const { d1Query } = await import("./d1");
  return d1Query<T>(sql, values);
}

export async function execute(sql: string, values: unknown[] = []) {
  const database = await db();
  if (database.kind === "postgres")
    return database.client.unsafe(postgresSql(sql), values);
  const { d1Execute } = await import("./d1");
  return d1Execute(sql, values);
}

export async function listAdminRecords() {
  const [bookings, drafts, attempts] = await Promise.all([
    query(`SELECT * FROM bookings ORDER BY created_at DESC`),
    query(
      `SELECT * FROM booking_drafts WHERE booking_id IS NULL ORDER BY updated_at DESC`,
    ),
    query(`SELECT * FROM payment_attempts ORDER BY updated_at DESC`),
  ]);
  return { bookings, drafts, attempts };
}

export async function saveDraft(input: {
  id?: string;
  step: number;
  data: Record<string, unknown>;
  total: number;
}) {
  const id = input.id || `DRAFT-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const existing = await query(
    `SELECT id, created_at FROM booking_drafts WHERE id = ?`,
    [id],
  );
  const data = JSON.stringify(input.data);
  const email = String(input.data.email || "") || null;
  const customerName = String(input.data.customerName || "") || null;
  if (existing.length)
    await execute(
      `UPDATE booking_drafts SET updated_at=?, current_step=?, email=?, customer_name=?, total=?, data=? WHERE id=?`,
      [now, input.step, email, customerName, input.total, data, id],
    );
  else
    await execute(
      `INSERT INTO booking_drafts (id,created_at,updated_at,current_step,status,email,customer_name,total,data,booking_id) VALUES (?,?,?,?,?,?,?,?,?,NULL)`,
      [
        id,
        now,
        now,
        input.step,
        "In progress",
        email,
        customerName,
        input.total,
        data,
      ],
    );
  return id;
}

export async function getDraft(id: string) {
  return (
    (await query(`SELECT * FROM booking_drafts WHERE id = ?`, [id]))[0] || null
  );
}

export async function createPendingBooking(
  data: Record<string, any>,
  draftId: string,
) {
  const existingDraft = await getDraft(draftId);
  if (existingDraft?.booking_id) {
    const existing = (
      await query(`SELECT id,total FROM bookings WHERE id=?`, [
        existingDraft.booking_id,
      ])
    )[0];
    if (existing)
      return { id: String(existing.id), total: Number(existing.total) };
  }
  if (
    data.fulfillment === "delivery" &&
    (!String(data.address || "").trim() ||
      !String(data.city || "").trim() ||
      data.state !== "GA" ||
      !/^\d{5}$/.test(String(data.zip || "")))
  ) {
    throw new Error(
      "A complete Georgia delivery address is required before checkout.",
    );
  }
  const phrase = String(data.phrase || "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .trim();
  const letters = phrase.replaceAll(" ", "");
  const subtotal = letters.length * 55;
  const rental = subtotal - (letters.length >= 4 ? subtotal * 0.1 : 0);
  const deliveryFee = data.fulfillment === "delivery" ? 75 : 0;
  const total =
    rental +
    deliveryFee +
    (data.fulfillment === "delivery" &&
    data.floor === "no" &&
    data.elevator === "yes"
      ? 25
      : 0);
  const id = `MLE-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  await execute(
    `INSERT INTO bookings (id,created_at,event_date,start_time,end_time,phrase,service,fulfillment,address,address_2,city,state,zip,delivery_miles,delivery_fee,floor,elevator,customer_name,email,phone,event_type,venue,display_location,notes,total,amount_paid,payment_status,status,letter_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      new Date().toISOString(),
      data.eventDate,
      data.startTime || "",
      data.endTime || "",
      phrase,
      `${letters.length} × 4-ft marquee letters`,
      data.fulfillment || "pickup",
      data.address || null,
      data.address2 || null,
      data.city || null,
      data.state || null,
      data.zip || null,
      null,
      deliveryFee || null,
      data.floor || null,
      data.elevator || null,
      data.customerName,
      data.email,
      data.phone || null,
      data.eventType || null,
      data.venue || null,
      data.displayLocation || null,
      data.notes || null,
      total,
      0,
      "Pending",
      "Awaiting payment",
      letters.length,
    ],
  );
  await execute(
    `UPDATE booking_drafts SET booking_id=?, status=?, updated_at=? WHERE id=?`,
    [id, "Checkout started", new Date().toISOString(), draftId],
  );
  return { id, total };
}

export async function createPaymentAttempt(input: {
  bookingId: string;
  draftId: string;
  sessionId?: string;
  mode: string;
  amount: number;
  status: string;
  error?: string;
}) {
  const id = `PAY-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO payment_attempts (id,booking_id,draft_id,stripe_session_id,mode,amount,status,error,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      input.bookingId,
      input.draftId,
      input.sessionId || null,
      input.mode,
      input.amount,
      input.status,
      input.error || null,
      now,
      now,
    ],
  );
  return id;
}

export async function attachStripeSession(
  attemptId: string,
  sessionId: string,
) {
  await execute(
    `UPDATE payment_attempts SET stripe_session_id=?, status=?, updated_at=? WHERE id=?`,
    [sessionId, "Checkout open", new Date().toISOString(), attemptId],
  );
}

export async function failPaymentAttempt(attemptId: string, error: string) {
  await execute(
    `UPDATE payment_attempts SET status=?, error=?, updated_at=? WHERE id=?`,
    ["Failed", error.slice(0, 500), new Date().toISOString(), attemptId],
  );
}

export async function getPaymentAttemptBySession(sessionId: string) {
  return (
    (
      await query(`SELECT * FROM payment_attempts WHERE stripe_session_id=?`, [
        sessionId,
      ])
    )[0] || null
  );
}

export async function markPayment(
  sessionId: string,
  status: string,
  paidAmount = 0,
  error: string | null = null,
) {
  const now = new Date().toISOString();
  const [attempt] = await query(
    `SELECT booking_id,draft_id FROM payment_attempts WHERE stripe_session_id=?`,
    [sessionId],
  );
  if (!attempt) return { bookingId: null, transitionedToPaid: false };
  await execute(
    `UPDATE payment_attempts SET status=?, error=?, updated_at=? WHERE stripe_session_id=?`,
    [status, error, now, sessionId],
  );
  if (status === "Paid") {
    const result = await execute(
      `UPDATE bookings SET payment_status='Paid', amount_paid=?, status='New request' WHERE id=? AND payment_status<>'Paid'`,
      [paidAmount, attempt.booking_id],
    );
    const transitionedToPaid = Number(
      result?.count ?? result?.meta?.changes ?? result?.changes ?? 0,
    ) > 0;
    if (attempt.draft_id)
      await execute(
        `UPDATE booking_drafts SET status='Completed', updated_at=? WHERE id=?`,
        [now, attempt.draft_id],
      );
    return { bookingId: String(attempt.booking_id), transitionedToPaid };
  }
  return { bookingId: String(attempt.booking_id), transitionedToPaid: false };
}

export async function getBookingForCrm(id: string) {
  const booking = (
    await query(`SELECT * FROM bookings WHERE id=?`, [id])
  )[0];
  if (!booking) return null;
  const draft = (
    await query(`SELECT data FROM booking_drafts WHERE booking_id=?`, [id])
  )[0];
  let draftData: Record<string, unknown> = {};
  try {
    draftData = draft?.data ? JSON.parse(String(draft.data)) : {};
  } catch {}
  return { ...booking, ...draftData };
}

export async function updateBookingStatus(id: string, status: string) {
  await execute(`UPDATE bookings SET status=? WHERE id=?`, [status, id]);
}

export async function getStripeSettings() {
  return (
    (await query(`SELECT * FROM stripe_settings WHERE id='primary'`))[0] || null
  );
}

export async function saveStripeSettings(values: Record<string, unknown>) {
  const existing = await getStripeSettings();
  const columns = [
    "active_mode",
    "test_publishable_key",
    "test_secret_key_encrypted",
    "test_webhook_secret_encrypted",
    "live_publishable_key",
    "live_secret_key_encrypted",
    "live_webhook_secret_encrypted",
    "updated_at",
  ];
  const data = columns.map(
    (column) => values[column] ?? existing?.[column] ?? null,
  );
  if (existing)
    await execute(
      `UPDATE stripe_settings SET active_mode=?,test_publishable_key=?,test_secret_key_encrypted=?,test_webhook_secret_encrypted=?,live_publishable_key=?,live_secret_key_encrypted=?,live_webhook_secret_encrypted=?,updated_at=? WHERE id='primary'`,
      data,
    );
  else
    await execute(
      `INSERT INTO stripe_settings (id,active_mode,test_publishable_key,test_secret_key_encrypted,test_webhook_secret_encrypted,live_publishable_key,live_secret_key_encrypted,live_webhook_secret_encrypted,updated_at) VALUES ('primary',?,?,?,?,?,?,?,?)`,
      data,
    );
}
