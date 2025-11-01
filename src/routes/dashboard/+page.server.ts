import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { job } from "$lib/server/db/schema";
import { eq, desc, and, or, not } from "drizzle-orm";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const jobs = await db.select().from(job).orderBy(desc(job.scheduledDate))
        .where(
            and(
                eq(job.userId, event.locals.user.id),
                or(
                    eq(job.jobStatus, "unscheduled"),
                    eq(job.jobStatus, "scheduled"),
                    eq(job.jobStatus, "in_progress")
                )
            ));

    return { jobs };
};