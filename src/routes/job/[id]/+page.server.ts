import { error, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { job } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getJobStaticFileServePath, getJobStaticFileWritePath } from "$lib/utils";
import { mkdirSync } from "fs";
import { createInvoice } from "$lib/server/pdf/invoice";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const result = await db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        with: {
            client: true,
            materials: true,
            notes: {
                with: {
                    attachments: true,
                }
            },
        }
    });

    const dirPath = getJobStaticFileServePath(event.locals.user.id, event.params.id);
    if (!result) {
        error(404, "Not found.");
    }

    return { job: result, attachmentPath: dirPath };
};

export const actions: Actions = {
    quote: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const jobData = await db.query.job.findFirst({
            where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
            with: {
                client: true,
                materials: true,
            }
        });

        if (!jobData) {
            error(404, "Not found.");
        }

        const dirPath = getJobStaticFileWritePath(event.locals.user.id, event.params.id);
        const fileName = `Quote_${jobData.jobNumber}_${new Date().toISOString().replace(".", "_")}.pdf`
        const fullPath = `${dirPath}${fileName}`

        mkdirSync(dirPath, { recursive: true });

        console.log(fullPath)
        createInvoice(jobData, jobData.client, jobData.materials, fullPath);

        return redirect(303, `${getJobStaticFileServePath(event.locals.user.id, event.params.id)}${fileName}`)
    }
};