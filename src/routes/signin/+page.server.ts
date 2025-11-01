import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import z from "zod";
import { auth } from "$lib/server/auth";
import { APIError } from "better-auth";
import { firstError } from "$lib/utils";

const signInSchema = z.object({
    email: z.email("Invalid email."),
    password: z.string(),
})

export const load: PageServerLoad = async (event) => {
    if (event.locals.session) {
        redirect(303, "/dashboard")
    }
};

export const actions: Actions = {
    default: async (event) => {
        const formData = await event.request.formData();

        let result = signInSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        if (result.success) {
            try {
                await auth.api.signInEmail({
                    body: result.data,

                });
            } catch (error) {
                if (error instanceof APIError) {
                    return fail(400, { message: error.message });
                }
            }

            redirect(303, "/dashboard")
        } else {
            return fail(400, { message: firstError(result.error) });
        }
    }
};