CREATE TABLE `sync_conflicts` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`record_id` text NOT NULL,
	`local_data` text NOT NULL,
	`remote_data` text NOT NULL,
	`resolved` integer DEFAULT false,
	`resolution` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `app_users` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `app_users` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `products` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `inventory_items` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `stock_movements` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `dining_tables` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `dining_tables` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `order_items` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `suppliers` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `purchases` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `purchases` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `purchase_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `purchase_items` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `supplier_payments` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `supplier_payments` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `daily_closings` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `daily_closings` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `daily_closing_items` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `daily_closing_items` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `last_modified_by` text;--> statement-breakpoint
ALTER TABLE `order_audit_log` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `order_audit_log` ADD `last_modified_by` text;