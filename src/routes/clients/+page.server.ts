import { client } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, '/signin');
    }

    // Load user's clients with job count
    const clients = await event.locals.db.query.client.findMany({
        where: eq(client.userId, event.locals.user.id),
        with: {
            jobs: {
                columns: {
                    id: true
                }
            }
        }
    });

    // Transform to include job count
    const clientsWithCount = clients.map(c => ({
        ...c,
        jobCount: c.jobs.length
    }));

    return {
        clients: clientsWithCount
    };
};
