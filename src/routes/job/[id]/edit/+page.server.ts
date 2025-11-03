import type { Actions, PageServerLoad } from "./$types";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { editJobFormSchema } from "../../schema";
import { db } from "$lib/server/db";
import { job, type Job } from "$lib/server/db/schema";
import { redirect, error, fail } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import type { NullToUndefined } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const result = await db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        with: {
            client: true,
            materials: true,
        }
    }) as NullToUndefined<Job>;

    if (!result) {
        return error(404, "Not found.");
    }
    return {
        form: await superValidate(result, zod4(editJobFormSchema)),
    }
};

export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }
        const form = await superValidate(event.request, zod4(editJobFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobId = event.params.id;

        try {
            await db.update(job).set(form.data).where(and(eq(job.id, jobId), eq(job.userId, event.locals.user.id)));
        } catch (err) {
            error(500, "Internal server error.")
        }

        redirect(303, `/job/${jobId}`);
    }
};

