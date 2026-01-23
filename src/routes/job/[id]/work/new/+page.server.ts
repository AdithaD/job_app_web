import { db } from '$lib/server/db';
import { job, work, workTemplate } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { addWorkFormSchema } from '../../../validation';
import type { Actions, PageServerLoad } from './$types';
import { material } from '$lib/server/db/schema';
import { getMaterialsFromFormData } from '$lib/utils';

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

	if (!jobQuery) {
		return error(404, 'Not found.');
	}

	// Load user's work templates
	const templates = await db.query.workTemplate.findMany({
		where: eq(workTemplate.userId, event.locals.user.id),
		with: {
			materials: true
		},
		orderBy: (workTemplate, { desc }) => [desc(workTemplate.createdAt)]
	});

	// Check for template ID in URL params
	const templateId = event.url.searchParams.get('templateId');
	let initialData = {};
	let initialMaterials: Array<{ templateId: string; name: string; cost: number; quantity: number }> = [];

	if (templateId) {
		const selectedTemplate = templates.find(t => t.id === templateId);
		if (selectedTemplate) {
			initialData = {
				title: selectedTemplate.title,
				description: selectedTemplate.description,
				labourHours: selectedTemplate.labourHours,
				labourRate: selectedTemplate.labourRate
			};
			initialMaterials = selectedTemplate.materials;
		}
	}

	return {
		jobId: jobQuery.id,
		templates,
		initialMaterials,
		form: await superValidate(initialData, zod4(addWorkFormSchema))
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
					.insert(work)
					.values({ ...form.data, jobId })
					.returning()
			)[0];

			// parse materials
			const materials = getMaterialsFromFormData(formData);
			materials.forEach((m) => (m.workId = insertedWork.id));

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
