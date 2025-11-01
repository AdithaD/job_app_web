import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z, { ZodError, type ZodSafeParseResult } from "zod";
import type { JobStatus, PaymentStatus } from "./server/db/schema";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function firstError(error: ZodError<any>) {
	const flat = z.flattenError(error);
	const errors = [...Object.values(flat.formErrors), ...Object.values(flat.fieldErrors)];
	return errors.at(0)?.at(0) ?? "Something went wrong.";
}

const jsToString: Record<JobStatus, string> = {
	unscheduled: "Unscheduled",
	scheduled: "Scheduled",
	in_progress: "In Progress",
	cancelled: "Cancelled",
	completed: "Completed"

}
export function jobStatusToString(status: JobStatus) {
	return jsToString[status];
}
const psToString: Record<PaymentStatus, string> = {
	unquoted: "Unquoted",
	quoted: "Quoted",
	invoiced: "Invoiced",
	paid: "Paid"
}
export function paymentStatusToString(status: PaymentStatus) {
	return psToString[status];
}