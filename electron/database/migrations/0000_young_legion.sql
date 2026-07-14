CREATE TABLE `app_users` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`role` text NOT NULL,
	`name` text,
	`email` text,
	`created_at` text,
	`local_password_hash` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`name` text NOT NULL,
	`order` integer DEFAULT 0,
	`status` text DEFAULT 'active',
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`cost` real NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'active',
	`track_stock` integer DEFAULT false,
	`inventory_item_id` text,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`unit` text NOT NULL,
	`stock_quantity` real DEFAULT 0 NOT NULL,
	`low_stock_threshold` real DEFAULT 10 NOT NULL,
	`cost_per_unit` real DEFAULT 0 NOT NULL,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity` real NOT NULL,
	`reference_type` text,
	`reference_id` text,
	`notes` text,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `dining_tables` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`name_or_number` text NOT NULL,
	`status` text DEFAULT 'available',
	`current_order_id` text,
	`capacity` integer,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`table_id` text,
	`order_type` text NOT NULL,
	`status` text NOT NULL,
	`payment_method` text,
	`total_amount` real NOT NULL,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`subtotal` real NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_name` text,
	`phone` text,
	`email` text,
	`address` text,
	`total_purchases` real DEFAULT 0,
	`total_paid` real DEFAULT 0,
	`total_due` real DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`reference_number` text,
	`date` text NOT NULL,
	`total_amount` real NOT NULL,
	`payment_status` text NOT NULL,
	`amount_paid` real DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_cost` real NOT NULL,
	`subtotal` real NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `supplier_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`supplier_id` text NOT NULL,
	`purchase_id` text,
	`amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`date` text NOT NULL,
	`reference_number` text,
	`notes` text,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`date` text NOT NULL,
	`created_by` text,
	`payment_method` text,
	`reference_number` text,
	`created_at` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `daily_closings` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`closing_date` text NOT NULL,
	`closed_at` text NOT NULL,
	`closed_by` text NOT NULL,
	`total_orders` integer NOT NULL,
	`total_sales` real NOT NULL,
	`cash_sales` real NOT NULL,
	`instapay_sales` real NOT NULL,
	`vodafone_cash_sales` real NOT NULL,
	`total_expenses` real NOT NULL,
	`cash_in_drawer` real NOT NULL,
	`expected_cash` real NOT NULL,
	`difference` real NOT NULL,
	`notes` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `daily_closing_items` (
	`id` text PRIMARY KEY NOT NULL,
	`daily_closing_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity_sold` integer NOT NULL,
	`total_sales` real NOT NULL,
	`category_name` text NOT NULL,
	`product_name` text NOT NULL,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`language` text,
	`cafe_name` text,
	`currency` text,
	`print_paper_size` text,
	`cashier_permissions` text,
	`auto_backup_enabled` integer,
	`auto_backup_frequency` text,
	`auto_backup_time` text,
	`last_backup_date` text,
	`owner_pin_hash` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `order_audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`cafe_id` text NOT NULL,
	`order_id` text NOT NULL,
	`action` text NOT NULL,
	`performed_by` text,
	`timestamp` text NOT NULL,
	`reason` text,
	`details` text,
	`updated_at` text,
	`sync_status` text DEFAULT 'pending',
	`device_id` text,
	`version` integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`table_name` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`retry_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`record_id` text
);
