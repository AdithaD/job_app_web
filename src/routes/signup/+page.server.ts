import { auth } from "$lib/server/auth";
import { firstError } from "$lib/utils";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { APIError } from "better-auth";
import z from "zod";
import { db } from "$lib/server/db";
import { businessSettings } from "$lib/server/db/schema";

const signUpSchema = z.object({
    name: z.string().nonempty("Name can't be empty."),
    email: z.email("Invalid email."),
    password: z.string().min(8, { error: "Password must have 8 characters at minimum." }),
})

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();

        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        if (password != confirmPassword) {
            return fail(400, { message: "Passwords do not match." });
        }

        const name = formData.get('name');
        const email = formData.get('email');

        let result = signUpSchema.safeParse({ name, email, password });

        if (result.success) {
            let userId: string | undefined;
            try {
                const response = await auth.api.signUpEmail({
                    body: result.data,
                });
                userId = response.user?.id;
            } catch (error) {
                if (error instanceof APIError) {
                    return fail(400, { message: error.message });
                }
            }

            // Create default business settings for new user
            if (userId) {
                try {
                    await db.insert(businessSettings).values({
                        userId,
                        businessName: '',
                        abn: null,
                        address: null,
                        phone: null,
                        email: null,
                        bsb: null,
                        accountNumber: null,
                        accountName: null,
                        logo: null,
                        terms: null,
                        defaultNotes: null
                    });
                } catch (error) {
                    console.error('Failed to create default business settings:', error);
                }
            }

            redirect(303, "/dashboard")
        } else {
            return fail(400, { message: firstError(result.error) });
        }
    },
};