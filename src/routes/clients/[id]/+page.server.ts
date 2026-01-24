import { db } from '$lib/server/db';
import { client, job } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, '/signin');
    }

    // Load client with all related jobs
    const clientData = await db.query.client.findFirst({
        where: and(eq(client.id, event.params.id), eq(client.userId, event.locals.user.id)),
        with: {
            jobs: {
                orderBy: (job, { desc }) => [desc(job.scheduledDate)]
            }
        }
    });

    if (!clientData) {
        return error(404, 'Client not found');
    }

    return {
        client: clientData
    };
};

export const actions: Actions = {
    delete: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, '/signin');
        }

        const formData = await event.request.formData();
        const clientId = event.params.id;
        const deleteJobs = formData.get('deleteJobs') === 'true';

        // Verify the client belongs to the user
        const clientData = await db.query.client.findFirst({
            where: and(eq(client.id, clientId), eq(client.userId, event.locals.user.id)),
            with: {
                jobs: {
                    columns: {
                        id: true
                    }
                }
            }
        });

        if (!clientData) {
            return fail(404, { error: 'Client not found' });
        }

        try {
            if (deleteJobs) {
                // Delete all jobs associated with this client
                await db.delete(job).where(eq(job.clientId, clientId));
            } else {
                // Set clientId to null for all jobs
                await db.update(job).set({ clientId: null }).where(eq(job.clientId, clientId));
            }

            // Delete the client
            await db.delete(client).where(eq(client.id, clientId));

            return redirect(303, '/clients');
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to delete client' });
        }
    }
};
