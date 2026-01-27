import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import { businessSettings } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

const businessSettingsSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    abn: z.string().optional().default(''),
    address: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    email: z.email("Invalid email").optional().or(z.literal('')).default(''),
    bsb: z.string().optional().default(''),
    accountNumber: z.string().optional().default(''),
    accountName: z.string().optional().default(''),
    terms: z.string().optional().default(''),
});

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, "/signin");
    }

    const settings = await event.locals.db.query.businessSettings.findFirst({
        where: eq(businessSettings.userId, event.locals.user.id)
    });

    // Convert null to undefined for SuperForms
    const formData = settings ? {
        businessName: settings.businessName,
        abn: settings.abn || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        bsb: settings.bsb || '',
        accountNumber: settings.accountNumber || '',
        accountName: settings.accountName || '',
        terms: settings.terms || '',
        defaultNotes: settings.defaultNotes || '',
    } : {};

    // Load form with existing settings
    const form = await superValidate(formData, zod4(businessSettingsSchema));

    return {
        form
    };
};

export const actions: Actions = {
    update: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, "/signin");
        }

        const form = await superValidate(event.request, zod4(businessSettingsSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const updateData = {
            businessName: form.data.businessName,
            abn: form.data.abn || null,
            address: form.data.address || null,
            phone: form.data.phone || null,
            email: form.data.email || null,
            bsb: form.data.bsb || null,
            accountNumber: form.data.accountNumber || null,
            accountName: form.data.accountName || null,
            terms: form.data.terms || null,
        };

        await event.locals.db
            .update(businessSettings)
            .set(updateData)
            .where(eq(businessSettings.userId, event.locals.user.id));

        return message(form, "Settings updated!");
    }
};
