import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { client, job } from "$lib/server/db/schema";
import { eq, desc, and, or, not } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const clients = await event.locals.db.query.client.findMany({
        where: eq(client.userId, event.locals.user.id),
        columns: {
            name: true,
            id: true,
        }
    });

    const jobs = await event.locals.db.query.job.findMany({
        where:
            eq(job.userId, event.locals.user.id),
        orderBy: desc(job.scheduledDate),
        with: {
            client: {
                columns: {
                    name: true,
                }
            }
        }
    });

    return { jobs, clients };
};