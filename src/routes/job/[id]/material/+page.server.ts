import { db } from "$lib/server/db";
import { job } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { addJobFormSchema } from "../../schema";
import type { Actions, PageServerLoad } from "./$types";
import { material } from "$lib/server/db/schema";
import z from "zod";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const jobQuery = await db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        columns: {
            id: true,
            title: true,
        },
        with: {
            materials: true,
        }
    });

    if (!jobQuery) {
        return error(404, "Not found.");
    }
    return {
        job: jobQuery,
        form: await superValidate(zod4(addJobFormSchema)),
    }
};

export const actions: Actions = {
    remove: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();

        try {
            let name = z.string().parse(formData.get('name'));
            let userJobs = db.select({ id: job.id }).from(job).where(eq(job.userId, event.locals.user.id));

            await db
                .delete(material).where(
                    and(
                        eq(material.name, name),
                        eq(material.jobId, event.params.id),
                        inArray(material.jobId, userJobs)
                    )
                );
        } catch (e) {
            return error(400, { message: "Bad request" })
        }
    },
    add: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }
        const form = await superValidate(event.request, zod4(addJobFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobId = event.params.id;

        try {
            await db.insert(material).values({ ...form.data, jobId });
        } catch (err) {
            error(500, "Internal server error.")
        }
    }
};