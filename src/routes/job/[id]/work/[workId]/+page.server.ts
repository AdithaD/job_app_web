
import { job, material, work, type Work, workTemplate, templateMaterial } from '$lib/server/db/schema';
import { error, redirect, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addWorkFormSchema } from '../../../validation';
import type { Actions, PageServerLoad } from './$types';
import { getMaterialsFromFormData, type NullToUndefined } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.session || !event.locals.user) {
		return redirect(303, '/signin');
	}

	const jobQuery = await event.locals.db.query.job.findFirst({
		where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
		columns: {
			id: true
		}
	});
	const workQuery = await event.locals.db.query.work.findFirst({
		where: and(eq(work.jobId, event.params.id), eq(work.id, event.params.workId)),
		with: {
			materials: true
		}
	});

	if (!jobQuery || !workQuery) {
		return error(404, 'Not found.');
	}

	const materials = workQuery.materials;
	console.log(materials);

	type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
	const workWithoutMaterials: PartialBy<typeof workQuery, 'materials'> = workQuery;
	delete workWithoutMaterials['materials'];

	return {
		jobId: jobQuery.id,
		work: workWithoutMaterials,
		materials,
		form: await superValidate(
			workWithoutMaterials as NullToUndefined<Work>,
			zod4(addWorkFormSchema)
		)
	};
};

export const actions: Actions = {
	delete: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			throw redirect(303, '/signin');
		}

		const ownedJob = await event.locals.db
			.select({ id: job.id })
			.from(job)
			.where(and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)))
			.get();

		if (!ownedJob) {
			throw error(403, 'Forbidden');
		}

		await event.locals.db.delete(work).where(and(eq(work.id, event.params.workId), eq(work.jobId, ownedJob.id)));

		throw redirect(303, `/job/${event.params.id}`);
	},

	edit: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return redirect(303, '/signin');
		}

		const formData = await event.request.formData();

		const form = await superValidate(formData, zod4(addWorkFormSchema));
		console.log(addWorkFormSchema.parse(Object.fromEntries(formData.entries())));
		if (!form.valid) {
			return fail(400, { form });
		}

		const jobId = event.params.id;

		try {
			const insertedWork = (
				await event.locals.db
					.update(work)
					.set({ ...form.data })
					.where(and(eq(work.jobId, jobId), eq(work.id, event.params.workId)))
					.returning()
			)[0];

			// parse materials
			const materials = getMaterialsFromFormData(formData);
			materials.forEach((m) => (m.workId = insertedWork.id));

			await event.locals.db.delete(material).where(eq(material.workId, insertedWork.id));

			if (materials.length > 0) {
				await event.locals.db.insert(material).values(materials);
			}
			// add to db
		} catch (err) {
			console.log(err);
			error(500, 'Internal server error.');
		}
		redirect(303, `/job/${jobId}`);
	},

	saveAsTemplate: async (event) => {
		if (!event.locals.session || !event.locals.user) {
			return redirect(303, '/signin');
		}

		const ownedJob = await event.locals.db
			.select({ id: job.id })
			.from(job)
			.where(and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)))
			.get();

		if (!ownedJob) {
			throw error(403, 'Forbidden');
		}

		// Get the work with materials
		const workQuery = await event.locals.db.query.work.findFirst({
			where: and(eq(work.jobId, event.params.id), eq(work.id, event.params.workId)),
			with: {
				materials: true
			}
		});

		if (!workQuery) {
			throw error(404, 'Work not found');
		}

		try {
			// Create the template
			const insertedTemplate = (
				await event.locals.db
					.insert(workTemplate)
					.values({
						userId: event.locals.user.id,
						title: workQuery.title,
						description: workQuery.description,
						labourHours: workQuery.labourHours,
						labourRate: workQuery.labourRate,
						createdAt: new Date()
					})
					.returning()
			)[0];

			// Copy materials to template materials
			if (workQuery.materials.length > 0) {
				const templateMaterials = workQuery.materials.map(m => ({
					templateId: insertedTemplate.id,
					name: m.name,
					cost: m.cost,
					quantity: m.quantity
				}));
				await event.locals.db.insert(templateMaterial).values(templateMaterials);
			}

			return { success: true, message: 'Template saved successfully!' };
		} catch (err) {
			console.log(err);
			return fail(500, { error: 'Failed to save template' });
		}
	}
};
