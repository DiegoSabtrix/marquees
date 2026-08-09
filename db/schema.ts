import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  eventDate: text("event_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  phrase: text("phrase").notNull(),
  service: text("service").notNull(),
  fulfillment: text("fulfillment").notNull(),
  zip: text("zip"),
  floor: text("floor"),
  elevator: text("elevator"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventType: text("event_type"),
  venue: text("venue"),
  displayLocation: text("display_location"),
  notes: text("notes"),
  total: real("total").notNull(),
  amountPaid: real("amount_paid").notNull().default(0),
  paymentStatus: text("payment_status").notNull().default("Unpaid"),
  status: text("status").notNull().default("New request"),
  letterCount: integer("letter_count").notNull(),
});

export const stripeSettings = sqliteTable("stripe_settings", {
  id: text("id").primaryKey(),
  activeMode: text("active_mode").notNull().default("test"),
  testPublishableKey: text("test_publishable_key"),
  testSecretKeyEncrypted: text("test_secret_key_encrypted"),
  testWebhookSecretEncrypted: text("test_webhook_secret_encrypted"),
  livePublishableKey: text("live_publishable_key"),
  liveSecretKeyEncrypted: text("live_secret_key_encrypted"),
  liveWebhookSecretEncrypted: text("live_webhook_secret_encrypted"),
  updatedAt: text("updated_at").notNull(),
});
