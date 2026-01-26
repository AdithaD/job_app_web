import { attachment, job, note } from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { fail, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { addNoteFormSchema } from "../../validation";
import type { Actions, PageServerLoad } from "./$types";
import z from "zod";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { getJobStaticFileServePath, getJobStaticFileWritePath } from "$lib/utils";

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const jobQuery = await event.locals.db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        columns: {
            id: true,
            title: true,
        },
        with: {
            notes: {
                with: {
                    attachments: true,
                }
            },
        }
    });

    if (!jobQuery) {
        return error(404, "Not found.");
    }
    const attachmentPath = getJobStaticFileServePath(event.locals.user.id, event.params.id);
    return {
        job: jobQuery,
        form: await superValidate(zod4(addNoteFormSchema)),
        attachmentPath,
    }
};

export const actions: Actions = {
    remove: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();

        try {
            let noteId = z.string().parse(formData.get('id'));
            let userJobs = event.locals.db.select({ id: job.id }).from(job).where(eq(job.userId, event.locals.user.id));

            let result = await event.locals.db
                .delete(note).where(
                    and(
                        eq(note.id, noteId),
                        eq(note.jobId, event.params.id),
                        inArray(note.jobId, userJobs)
                    )
                );

            const dirPath = getJobStaticFileWritePath(event.locals.user.id, event.params.id);
            rmSync(`${dirPath}${noteId}/`, { recursive: true });

        } catch (e) {
            console.log(e)
            return error(400, { message: "Bad request" })
        }
    },
    add: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }
        const form = await superValidate(event.request, zod4(addNoteFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobId = event.params.id;

        try {
            let row = await event.locals.db.insert(note).values({ ...form.data, jobId, createdAt: new Date(), updatedAt: new Date() }).returning();

            // upload attachment if it exists
            if (form.data.file) {
                const bytes = await form.data.file.arrayBuffer();

                const fileName = form.data.file.name;
                const path = `${getJobStaticFileWritePath(event.locals.user.id, jobId)}${row[0].id}/`;

                mkdirSync(path, { recursive: true });
                writeFileSync(`${path}${fileName}`, Buffer.from(bytes));

                await event.locals.db.insert(attachment).values({ name: fileName, noteId: row[0].id, size: form.data.file.size })
                console.log('inserted attachment')
            }

        } catch (err) {
            console.log(err)
            error(500, "Internal server error.")
        }
    }
};