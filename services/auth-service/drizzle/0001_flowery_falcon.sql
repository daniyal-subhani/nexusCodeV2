ALTER TABLE `refresh_tokens` ADD `used` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD `used_at` timestamp;