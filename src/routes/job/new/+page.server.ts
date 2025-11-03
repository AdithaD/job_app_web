import { db } from "$lib/server/db";
import { job } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { eq, max } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { editJobFormSchema } from "../schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod4(editJobFormSchema)),
    };
};
export const actions: Actions = {
    default: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }
        const form = await superValidate(event.request, zod4(editJobFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobNumberQuery = await db.select({ jobNumber: max(job.jobNumber) }).from(job).where(eq(job.userId, event.locals.user.id));
        const jobNumber = (jobNumberQuery.at(0)?.jobNumber ?? 0) + 1;

        try {
            var insertedRow = await db.insert(job).values({ userId: event.locals.user.id, jobNumber, ...form.data }).returning({ id: job.id });
        } catch (err) {
            error(500, "Internal server error.")
        }

        redirect(303, `/job/${insertedRow[0].id}`);
    }
};

