CREATE TABLE `booking_drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`current_step` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'In progress' NOT NULL,
	`email` text,
	`customer_name` text,
	`total` real DEFAULT 0 NOT NULL,
	`data` text NOT NULL,
	`booking_id` text
);
--> statement-breakpoint
CREATE TABLE `payment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`draft_id` text,
	`stripe_session_id` text,
	`mode` text NOT NULL,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
