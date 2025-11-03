import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { job } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { tuple } from "zod";

export const load: LayoutServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const result = await db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        with: {
            client: true,
            materials: true,
        }
    });

    if (!result) {
        error(404, "Not found.");
    }

    return { job: result };
};