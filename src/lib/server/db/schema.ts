import { jobStatuses, paymentStatuses } from '../../schema';
import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	isAnonymous: integer('is_anonymous', { mode: 'boolean' }).default(false),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const job = sqliteTable("job", {
	id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	clientId: text('client_id').references(() => client.id),
	jobNumber: integer('job_number').notNull(),
	title: text("title").notNull().default("New Job"),
	description: text("description"),
	location: text("location"),
	scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
	jobStatus: text("job_status", { enum: jobStatuses }).notNull().default("unscheduled"),
	paymentStatus: text("payment_status", { enum: paymentStatuses }).notNull().default("unquoted"),
	quotedAmount: integer("quoted_amount").notNull().default(0),
	paidAmount: integer("paid_amount").notNull().default(0),
});

export const material = sqliteTable("material", {
	jobId: text('job_id').references(() => job.id, { onDelete: 'cascade' }).notNull(),
	name: text('name').notNull(),
	cost: integer('cost').notNull(),
	quantity: integer('quantity'),
}, (table) => [
	primaryKey({ columns: [table.jobId, table.name] })
])

export const note = sqliteTable("note", {
	id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
	jobId: text('job_id').references(() => job.id, { onDelete: 'cascade' }).notNull(),
	content: text('content').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const attachment = sqliteTable("attachment", {
	name: text('name').notNull(),
	noteId: text('note_id').references(() => note.id, { onDelete: 'cascade' }).notNull(),
	size: integer('size').notNull(),
}, (table) => [
	primaryKey({ columns: [table.name, table.noteId] })
]);

export const attachmentRelations = relations(attachment, ({ one }) => ({
	note: one(note, {
		fields: [attachment.noteId],
		references: [note.id],
	})
}));

export const materialRelations = relations(material, ({ one }) => ({
	job: one(job, {
		fields: [material.jobId],
		references: [job.id],
	})
}));

export const noteRelations = relations(note, ({ one, many }) => ({
	job: one(job, {
		fields: [note.jobId],
		references: [job.id],
	}),
	attachments: many(attachment)
}))

export const jobRelations = relations(job, ({ one, many }) => ({
	client: one(client, {
		fields: [job.clientId],
		references: [client.id]
	}),
	materials: many(material),
	notes: many(note),
}))

export const client = sqliteTable("client", {
	id: text("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text("name").notNull(),
	phone: text("phone"),
	address: text("address"),
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Job = typeof job.$inferSelect;
export type Client = typeof client.$inferSelect;
export type Material = typeof material.$inferSelect;
export type Note = typeof note.$inferSelect;
export type Attachment = typeof attachment.$inferSelect;