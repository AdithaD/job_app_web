import { db } from "$lib/server/db";
import { job, note } from "$lib/server/db/schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import { fail, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { addMaterialFormSchema, addNoteFormSchema } from "../../validation";
import type { Actions, PageServerLoad } from "./$types";
import { material } from "$lib/server/db/schema";
import z from "zod";
import { mkdirSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

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
            notes: true,
        }
    });

    if (!jobQuery) {
        return error(404, "Not found.");
    }
    return {
        job: jobQuery,
        form: await superValidate(zod4(addNoteFormSchema)),
    }
};

export const actions: Actions = {
    remove: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();

        try {
            let id = z.string().parse(formData.get('id'));
            let userJobs = db.select({ id: job.id }).from(job).where(eq(job.userId, event.locals.user.id));

            await db
                .delete(note).where(
                    and(
                        eq(note.id, id),
                        eq(note.jobId, event.params.id),
                        inArray(note.jobId, userJobs)
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
        const form = await superValidate(event.request, zod4(addNoteFormSchema));
        if (!form.valid) return fail(400, { form });

        const jobId = event.params.id;
        const noteId = randomUUID();

        let filePath: string | undefined;
        // upload attachment if it exists
        if (form.data.file) {
            try {
                const bytes = await form.data.file.arrayBuffer();
                const dirPath = `static/${event.locals.user.id}/${jobId}/`;
                filePath = `${dirPath}/${noteId}-${form.data.file.name}`;
                mkdirSync(dirPath, { recursive: true });
                writeFileSync(filePath, Buffer.from(bytes));
            } catch (err) {
                console.log(err)
                error(500, "Internal server error.")
            }
        }
        try {
            await db.insert(note).values({ ...form.data, filePath, jobId, createdAt: new Date(), updatedAt: new Date() });
        } catch (err) {
            console.log(err)
            error(500, "Internal server error.")
        }
    }
};