import { auth } from "$lib/server/auth";
import { firstError } from "$lib/utils";
import { fail, redirect, type Actions } from "@sveltejs/kit";
import { APIError } from "better-auth";
import z from "zod";

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
            try {
                await auth.api.signUpEmail({
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
    },
};