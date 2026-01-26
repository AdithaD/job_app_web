DROP TABLE `attachment`;--> statement-breakpoint
ALTER TABLE `generated_document` ADD `object_key` text NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_document` ADD `file_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `generated_document` DROP COLUMN `document_number`;