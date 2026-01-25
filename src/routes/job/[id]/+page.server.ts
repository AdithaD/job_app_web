import { error, fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import { businessSettings, job } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getJobStaticFileServePath, getJobStaticFileWritePath } from "$lib/utils";
import { mkdirSync } from "fs";
import { createInvoice } from "$lib/server/pdf/invoice";
import { z } from "zod";

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

    const result = await db.query.job.findFirst({
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
    const settings = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.userId, event.locals.user.id)
    });

    return {
        job: result,
        attachmentPath: dirPath,
        businessSettings: settings
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

        const jobData = await db.query.job.findFirst({
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

        const settings = await db.query.businessSettings.findFirst({
            where: eq(businessSettings.userId, event.locals.user.id)
        });

        if (!settings) {
            return fail(400, { error: 'Please configure business settings first' });
        }

        const dirPath = getJobStaticFileWritePath(event.locals.user.id, event.params.id);
        const fileName = `Quote_${jobData.jobNumber}_${new Date().toISOString().replace(/[:.]/g, "_")}.pdf`
        const fullPath = `${dirPath}${fileName}`

        mkdirSync(dirPath, { recursive: true });

        const quoteNumber = `Q-${jobData.jobNumber}-${Date.now()}`;

        createInvoice(
            'quote',
            quoteNumber,
            jobData.jobNumber,
            new Date(),
            jobData.client,
            jobData.works,
            settings,
            fullPath,
            {
                showMaterials,
                showLabour,
                discount,
                notes: notes || undefined
            }
        );

        return redirect(303, `${getJobStaticFileServePath(event.locals.user.id, event.params.id)}${fileName}`)
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

        const jobData = await db.query.job.findFirst({
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

        const settings = await db.query.businessSettings.findFirst({
            where: eq(businessSettings.userId, event.locals.user.id)
        });

        if (!settings) {
            return fail(400, { error: 'Please configure business settings first' });
        }

        const dirPath = getJobStaticFileWritePath(event.locals.user.id, event.params.id);
        const fileName = `Invoice_${jobData.jobNumber}_${new Date().toISOString().replace(/[:.]/g, "_")}.pdf`
        const fullPath = `${dirPath}${fileName}`

        mkdirSync(dirPath, { recursive: true });

        const invoiceNumber = `INV-${jobData.jobNumber}-${Date.now()}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);

        createInvoice(
            'invoice',
            invoiceNumber,
            jobData.jobNumber,
            new Date(),
            jobData.client,
            jobData.works,
            settings,
            fullPath,
            {
                showMaterials,
                discount,
                notes: notes || undefined,
                dueDate
            }
        );

        return redirect(303, `${getJobStaticFileServePath(event.locals.user.id, event.params.id)}${fileName}`)
    }
};
