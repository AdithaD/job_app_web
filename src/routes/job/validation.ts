import { jobStatuses, paymentStatuses } from '$lib/schema';
import z from 'zod';

export const addMaterialFormSchema = z.object({
	name: z.string().min(1).nonempty(),
	cost: z.number().min(0).nonoptional(),
	quantity: z.coerce.number()
});

export const addNoteFormSchema = z.object({
	content: z.string().nonoptional(),
	file: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 5_000_000, 'Max 5MB upload size')
		.nullable()
});

export const editJobFormSchema = z.object({
	title: z.string().min(1).max(50).nonempty(),
	description: z.string().max(1000).optional().or(z.literal('')),
	location: z.string().optional(),
	scheduledDate: z.date().optional(),
	jobStatus: z.enum(jobStatuses).nonoptional(),
	paymentStatus: z.enum(paymentStatuses).nonoptional(),
	quotedAmount: z.number().default(0),
	paidAmount: z.number().default(0),
	clientId: z.string().optional(),
	newClientName: z.string().optional(),
	newClientAddress: z.string().optional(),
	newClientPhone: z.string().optional()
});
