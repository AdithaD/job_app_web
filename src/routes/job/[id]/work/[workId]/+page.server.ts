import { db } from '$lib/server/db';
import { job, material, work, type Work } from '$lib/server/db/schema';
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

	const jobQuery = await db.query.job.findFirst({
		where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
		columns: {
			id: true
		}
	});
	const workQuery = await db.query.work.findFirst({
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
	default: async (event) => {
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
				await db
					.update(work)
					.set({ ...form.data })
					.where(and(eq(work.jobId, jobId), eq(work.id, event.params.workId)))
					.returning()
			)[0];

			// parse materials
			const materials = getMaterialsFromFormData(formData);
			materials.forEach((m) => (m.workId = insertedWork.id));

			await db.delete(material).where(eq(material.workId, insertedWork.id));

			if (materials.length > 0) {
				await db.insert(material).values(materials);
			}
			// add to db
		} catch (err) {
			console.log(err);
			error(500, 'Internal server error.');
		}
		redirect(303, `/job/${jobId}`);
	}
};
