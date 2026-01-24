import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editJobFormSchema } from '../../validation';
import { db } from '$lib/server/db';
import { client, job, type Job } from '$lib/server/db/schema';
import { redirect, error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { NullToUndefined } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session || !event.locals.user) {
		return redirect(303, '/signin');
	}

	const jobQuery = (await db.query.job.findFirst({
		where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
		with: {
			client: true,
			works: {
				with: {
					materials: true
				}
			}
		}
	})) as NullToUndefined<Job>;

	const clients = await db.query.client.findMany({
		where: and(eq(client.userId, event.locals.user.id))
	});

	if (!jobQuery) {
		return error(404, 'Not found.');
	}
	return {
		job: jobQuery,
		clients,
		form: await superValidate(jobQuery, zod4(editJobFormSchema))
	};
};

export const actions: Actions = {
	edit: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return redirect(303, '/signin');
		}
		const form = await superValidate(event.request, zod4(editJobFormSchema));
		if (!form.valid) return fail(400, { form });

		const jobId = event.params.id;

		let clientId = form.data.clientId;
		if (form.data.newClientName) {
			const clientData = {
				name: form.data.newClientName,
				email: form.data.newClientEmail,
				address: form.data.newClientAddress,
				phone: form.data.newClientPhone
			};
			try {
				const newClient = await db
					.insert(client)
					.values({ userId: event.locals.user.id, ...clientData })
					.returning();
				clientId = newClient[0].id;
			} catch (e) {
				console.log(e);
				error(500, 'Internal server error.');
			}
		}

		try {
			await db
				.update(job)
				.set({ ...form.data, clientId })
				.where(and(eq(job.id, jobId), eq(job.userId, event.locals.user.id)));
		} catch (err) {
			console.log(err);
			error(500, 'Internal server error.');
		}

		redirect(303, `/job/${jobId}`);
	},
	delete: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return redirect(303, '/signin');
		}

		const jobId = event.params.id;

		const jobQuery = await db
			.delete(job)
			.where(and(eq(job.id, jobId), eq(job.userId, event.locals.user.id)));

		if (jobQuery.rowsAffected > 0) {
			redirect(303, `/dashboard`);
		} else {
			error(403, 'Forbidden');
		}
	}
};
