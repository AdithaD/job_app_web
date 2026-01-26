import { job, uploadedDocument } from "$lib/server/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";

export async function GET({ params, platform, locals }) {
    if (!locals.session || !locals.user) {
        return redirect(303, "/signin")
    }

    const jobQuery = await locals.db.query.job.findFirst({
        columns: { id: true },
        where: and(eq(job.id, params.id), eq(job.userId, locals.user.id))
    });

    if (!jobQuery) {
        return new Response("Forbidden.", { status: 403 })
    }

    const uploadedDocumentQuery = await locals.db.query.uploadedDocument.findFirst({
        where: and(eq(uploadedDocument.jobId, jobQuery.id), eq(uploadedDocument.fileName, params.key))
    })

    if (!uploadedDocumentQuery) {
        return new Response("File not found.", { status: 404 })
    }

    const pdf = await platform?.env.job_app_storage.get(uploadedDocumentQuery.objectKey);

    if (!pdf) {
        return new Response("File not found.", { status: 404 })
    }

    return new Response(await pdf.blob(), {
        status: 200,
        headers: {
            'Content-Type': uploadedDocumentQuery.fileType
        }
    })
}