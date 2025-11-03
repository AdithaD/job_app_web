import { jobStatuses, paymentStatuses } from "$lib/schema";
import z from "zod";

export const editJobFormSchema = z.object({
    title: z.string().min(1).max(50).nonempty(),
    description: z.string().min(1).max(1000).optional(),
    location: z.string().optional(),
    scheduledDate: z.date().optional(),
    jobStatus: z.enum(jobStatuses).nonoptional(),
    paymentStatus: z.enum(paymentStatuses).nonoptional(),
    quotedAmount: z.number().default(0),
    paidAmount: z.number().default(0),
    clientId: z.string().optional(),
});