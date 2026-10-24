ALTER TABLE `bookings` ADD `selected_symbols` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `symbol_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `total_items` integer DEFAULT 0 NOT NULL;