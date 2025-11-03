import { db } from "$lib/server/db";
import { client, job } from "$lib/server/db/schema";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq, max } from "drizzle-orm";
import { superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { editJobFormSchema } from "../schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }
    const clients = await db.query.client.findMany({
        where: and(eq(client.userId, event.locals.user.id))
    });
    return {
        form: await superValidate(zod4(editJobFormSchema)),
        clients,
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

        let clientId = form.data.clientId;
        if (form.data.newClientName) {
            const clientData = {
                name: form.data.newClientName,
                address: form.data.newClientAddress,
                phone: form.data.newClientPhone,
            }
            try {
                let newClient = await db.insert(client).values({ userId: event.locals.user.id, ...clientData }).returning();
                clientId = newClient[0].id;
            } catch (err) {
                error(500, "Internal server error.")
            }
        }
        try {
            var insertedRow = await db.insert(job).values({ userId: event.locals.user.id, jobNumber, ...form.data, clientId }).returning({ id: job.id });
        } catch (err) {
            error(500, "Internal server error.")
        }

        redirect(303, `/job/${insertedRow[0].id}`);
    }
};

