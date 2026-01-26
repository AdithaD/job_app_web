CREATE TABLE `attachments` (
	`note_id` text NOT NULL,
	`uploaded_document_id` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploaded_document_id`) REFERENCES `generated_document`(`id`) ON UPDATE no action ON DELETE cascade
);
