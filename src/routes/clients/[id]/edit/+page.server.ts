import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { editClientFormSchema } from '../../../job/validation';
import { client, type Client } from '$lib/server/db/schema';
import { redirect, error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { NullToUndefined } from '$lib/utils';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, '/signin');
    }

    const clientData = await event.locals.db.query.client.findFirst({
        where: and(eq(client.id, event.params.id), eq(client.userId, event.locals.user.id))
    }) as NullToUndefined<Client>;

    if (!clientData) {
        return error(404, 'Client not found');
    }

    return {
        client: clientData,
        form: await superValidate(clientData, zod4(editClientFormSchema))
    };
};

export const actions: Actions = {
    edit: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, '/signin');
        }

        const form = await superValidate(event.request, zod4(editClientFormSchema));
        if (!form.valid) return fail(400, { form });

        const clientId = event.params.id;

        try {
            await event.locals.db
                .update(client)
                .set({
                    name: form.data.name,
                    email: form.data.email || null,
                    phone: form.data.phone || null,
                    address: form.data.address || null
                })
                .where(and(eq(client.id, clientId), eq(client.userId, event.locals.user.id)));
        } catch (err) {
            console.log(err);
            return fail(500, { form, error: 'Failed to update client' });
        }

        redirect(303, `/clients/${clientId}`);
    }
};