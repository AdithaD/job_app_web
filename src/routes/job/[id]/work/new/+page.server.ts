import { db } from "$lib/server/db";
import { job, work } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { addMaterialFormSchema, addWorkFormSchema } from "../../../validation";
import type { Actions, PageServerLoad } from "./$types";
import { material } from "$lib/server/db/schema";
import { getMaterialsFromFormData } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const jobQuery = await db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        columns: {
            id: true,
        },
    });

    if (!jobQuery) {
        return error(404, "Not found.");

    }
    return {
        jobId: jobQuery.id,
        form: await superValidate(zod4(addWorkFormSchema)),
    }
};

export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();

        const form = await superValidate(event.request, zod4(addWorkFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobId = event.params.id;

        try {
            let insertedWork = (await db.insert(work).values({ ...form.data, jobId }).returning())[0];

            // parse materials
            let materials = getMaterialsFromFormData(formData);
            materials.forEach((m) => m.workId = insertedWork.id);

            // add to db
            await db.insert(material).values(materials);

            redirect(303, `/job/${jobId}`);
        } catch (err) {
            console.log(err)
            error(500, "Internal server error.")
        }
    },
};