import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { businessSettings, uploadedDocument, job } from "$lib/server/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getJobStaticFileServePath } from "$lib/utils";
import { mkdirSync } from "fs";
import { createInvoice } from "$lib/server/pdf/invoice";
import { z } from "zod";
import { randomUUID } from "crypto";
import type { DrizzleClient } from "$lib/server/db";

const quoteInvoiceSchema = z.object({
    showMaterials: z.coerce.boolean().default(true),
    showLabour: z.coerce.boolean().default(true),
    discount: z.coerce.number().min(0).max(100).default(0),
    notes: z.string().optional(),
    dueDays: z.coerce.number().int().min(0).default(30)
});

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin")
    }

    const result = await event.locals.db.query.job.findFirst({
        where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
        with: {
            client: true,
            works: {
                with: {
                    materials: true,
                }
            },
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

    // Load business settings
    const settings = await event.locals.db.query.businessSettings.findFirst({
        where: eq(businessSettings.userId, event.locals.user.id)
    });

    // Fetch latest quote and invoice
    const latestQuote = await event.locals.db.query.uploadedDocument.findFirst({
        where: and(
            eq(uploadedDocument.jobId, event.params.id),
            eq(uploadedDocument.type, 'quote')
        ),
        orderBy: desc(uploadedDocument.createdAt)
    });

    const latestInvoice = await event.locals.db.query.uploadedDocument.findFirst({
        where: and(
            eq(uploadedDocument.jobId, event.params.id),
            eq(uploadedDocument.type, 'invoice')
        ),
        orderBy: desc(uploadedDocument.createdAt)
    });

    return {
        job: result,
        attachmentPath: dirPath,
        businessSettings: settings,
        latestQuote,
        latestInvoice
    };
};

export const actions: Actions = {
    quote: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();
        const data = {
            showMaterials: formData.get('showMaterials'),
            showLabour: formData.get('showLabour'),
            discount: formData.get('discount'),
            notes: formData.get('notes'),
            dueDays: formData.get('dueDays')
        };

        const result = quoteInvoiceSchema.safeParse(data);
        if (!result.success) {
            return fail(400, { error: 'Invalid form data' });
        }

        const { showMaterials, showLabour, discount, notes } = result.data;

        const jobData = await event.locals.db.query.job.findFirst({
            where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
            with: {
                client: true,
                works: {
                    with: {
                        materials: true,
                    }
                }
            }
        });

        if (!jobData) {
            error(404, "Not found.");
        }

        const settings = await event.locals.db.query.businessSettings.findFirst({
            where: eq(businessSettings.userId, event.locals.user.id)
        });

        if (!settings) {
            return fail(400, { error: 'Please configure business settings first' });
        }

        const fileName = `Quote_${jobData.jobNumber}_${new Date().toISOString().replace(/[:.]/g, "_")}.pdf`
        const quoteNumber = `Q-${jobData.jobNumber}-${Date.now()}`;

        console.log('generating pdf')

        try {
            const filePath = `${event.locals.user.id}/${event.params.id}`
            const buffers: Buffer[] = [];
            await new Promise<void>((resolve, reject) => {
                createInvoice(
                    'quote',
                    quoteNumber,
                    jobData.jobNumber,
                    new Date(),
                    jobData.client,
                    jobData.works,
                    settings,
                    {
                        showMaterials,
                        discount,
                        notes: notes || undefined,
                    },
                    (doc) => {
                        doc.on("data", buffers.push.bind(buffers))
                        doc.on("end", async () => {
                            const pdf = Buffer.concat(buffers);
                            const object = await event.platform?.env.job_app_storage.put(`${filePath}/${fileName}`, pdf);

                            if (!object) {
                                reject()
                            } else {
                                await event.locals.db.insert(uploadedDocument).values({
                                    jobId: event.params.id,
                                    type: 'quote',
                                    objectKey: object.key,
                                    fileName,
                                    fileType: 'application/pdf',
                                    createdAt: new Date()
                                });
                                resolve()
                            }
                        })
                    }
                );
            })
        } catch (error) {
            console.log(error)
        }

    },

    invoice: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin")
        }

        const formData = await event.request.formData();
        const data = {
            showMaterials: formData.get('showMaterials'),
            discount: formData.get('discount'),
            notes: formData.get('notes'),
            dueDays: formData.get('dueDays')
        };

        const result = quoteInvoiceSchema.safeParse(data);
        if (!result.success) {
            return fail(400, { error: 'Invalid form data' });
        }

        const { showMaterials, discount, notes, dueDays } = result.data;

        const jobData = await event.locals.db.query.job.findFirst({
            where: and(eq(job.id, event.params.id), eq(job.userId, event.locals.user.id)),
            with: {
                client: true,
                works: {
                    with: {
                        materials: true,
                    }
                }
            }
        });

        if (!jobData) {
            error(404, "Not found.");
        }

        const settings = await event.locals.db.query.businessSettings.findFirst({
            where: eq(businessSettings.userId, event.locals.user.id)
        });

        if (!settings) {
            return fail(400, { error: 'Please configure business settings first' });
        }

        const fileName = `Invoice_${jobData.jobNumber}_${new Date().toISOString().replace(/[:.]/g, "_")}.pdf`
        const filePath = `${event.locals.user.id}/${event.params.id}`

        const invoiceNumber = `INV-${jobData.jobNumber}-${Date.now()}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);

        const buffers: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
            createInvoice(
                'invoice',
                invoiceNumber,
                jobData.jobNumber,
                new Date(),
                jobData.client,
                jobData.works,
                settings,
                {
                    showMaterials,
                    discount,
                    notes: notes || undefined,
                    dueDate
                },
                (doc) => {
                    doc.on("data", buffers.push.bind(buffers))
                    doc.on("end", async () => {
                        const pdf = Buffer.concat(buffers);
                        const object = await event.platform?.env.job_app_storage.put(`${filePath}/${fileName}`, pdf);

                        if (!object) {
                            reject()
                        } else {
                            await event.locals.db.insert(uploadedDocument).values({
                                jobId: event.params.id,
                                type: 'invoice',
                                objectKey: object.key,
                                fileName,
                                fileType: 'application/pdf',
                                createdAt: new Date()
                            });
                            resolve()
                        }
                    })
                }
            );
        })
    }
};
