import { attachment, job, note, uploadedDocument } from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { fail, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { addNoteFormSchema } from "../../validation";
import type { Actions, PageServerLoad } from "./$types";
import z from "zod";
import { getJobStaticFileServePath } from "$lib/utils";
import { randomUUID } from "crypto";

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
                    attachments: {
                        with: {
                            uploadedDocument: true,
                        }
                    },
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

            let noteId = row[0].id;

            // upload attachment if it exists
            if (form.data.file) {
                const bytes = await form.data.file.arrayBuffer();

                const fileName = `${new Date().getTime()}-${form.data.file.name}`;
                const objectKey = `${event.locals.user.id}/${event.params.id}/${fileName}`;

                const id = randomUUID();

                await event.platform?.env.job_app_storage.put(objectKey, bytes);
                await event.locals.db.insert(uploadedDocument).values({ id, jobId, objectKey, fileName, fileType: form.data.file.type, type: 'attachment', createdAt: new Date() })
                await event.locals.db.insert(attachment).values({ noteId, uploadedDocumentId: id })
            }

        } catch (err) {
            console.log(err)
            error(500, "Internal server error.")
        }
    }
};