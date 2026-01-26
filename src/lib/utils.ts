import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import z from 'zod';
import type { ZodError } from 'better-auth';
import type { JobStatus, PaymentStatus } from './schema';
import type { Material } from './server/db/schema';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function firstError(error: ZodError<any>) {
	const flat = z.flattenError(error);
	const errors = [...Object.values(flat.formErrors), ...Object.values(flat.fieldErrors)];
	return errors.at(0)?.at(0) ?? 'Something went wrong.';
}

const jsToString: Record<JobStatus, string> = {
	unscheduled: 'Unscheduled',
	scheduled: 'Scheduled',
	in_progress: 'In Progress',
	cancelled: 'Cancelled',
	completed: 'Completed'
};
export function jobStatusToString(status: JobStatus) {
	return jsToString[status];
}
const psToString: Record<PaymentStatus, string> = {
	unquoted: 'Unquoted',
	quoted: 'Quoted',
	invoiced: 'Invoiced',
	paid: 'Paid'
};
export function paymentStatusToString(status: PaymentStatus) {
	return psToString[status];
}
export type NullToUndefined<T> = {
	[K in keyof T]: T[K] extends null
	? undefined
	: T[K] extends (infer U)[]
	? NullToUndefined<U>[]
	: Exclude<T[K], null> | ([null] extends [T[K]] ? undefined : never);
};

export function getJobStaticFileServePath(userId: string, jobId: string) {
	return `/job/${jobId}/files`;
}
/**
 * Convert FormData with keys like:
 *   material[0].name
 *   material[0].cost
 *   material[0].quantity
 * into: Material[]
 *
 * @param formData - the HTMLFormFormData to parse
 * @returns array of Material objects sorted by index
 */
export function getMaterialsFromFormData(formData: FormData): Material[] {
	// Map index -> Partial<Material>
	const materialsByIndex: Record<number, Partial<Material>> = {};

	for (const [key, value] of formData.entries()) {
		// Only handle string values; skip files or non-strings
		if (typeof value !== 'string') continue;

		const match = key.match(/^material\[(\d+)\]\.(\w+)$/);
		if (!match) continue;

		const index = Number(match[1]);
		const field = match[2] as keyof Material;

		if (!materialsByIndex[index]) {
			materialsByIndex[index] = {};
		}

		if (field === 'cost' || field === 'quantity') {
			const num = Number(value);
			materialsByIndex[index][field] = Number.isNaN(num) ? 0 : num;
		} else {
			// name or other string fields
			materialsByIndex[index][field] = value;
		}
	}

	const indices = Object.keys(materialsByIndex)
		.map((n) => Number(n))
		.sort((a, b) => a - b);

	return indices.map((i) => materialsByIndex[i] as Material);
}
