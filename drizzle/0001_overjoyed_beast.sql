CREATE TABLE `stripe_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`active_mode` text DEFAULT 'test' NOT NULL,
	`test_publishable_key` text,
	`test_secret_key_encrypted` text,
	`test_webhook_secret_encrypted` text,
	`live_publishable_key` text,
	`live_secret_key_encrypted` text,
	`live_webhook_secret_encrypted` text,
	`updated_at` text NOT NULL
);
