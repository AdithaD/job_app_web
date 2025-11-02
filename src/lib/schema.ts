export type JobStatus = typeof jobStatuses[number];
export const jobStatuses = <const>["unscheduled", "scheduled", "in_progress", "completed", "cancelled"];

export type PaymentStatus = typeof paymentStatuses[number];
export const paymentStatuses = <const>["unquoted", "quoted", "invoiced", "paid"]; 