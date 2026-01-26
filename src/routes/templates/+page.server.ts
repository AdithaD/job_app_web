
import { workTemplate, templateMaterial } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
    if (!event.locals.session || !event.locals.user) {
        return redirect(303, '/signin');
    }

    // Load user's work templates
    const templates = await event.locals.db.query.workTemplate.findMany({
        where: eq(workTemplate.userId, event.locals.user.id),
        with: {
            materials: true
        },
        orderBy: (workTemplate, { desc }) => [desc(workTemplate.createdAt)]
    });

    return {
        templates
    };
};

export const actions: Actions = {
    delete: async (event) => {
        if (!event.locals.session || !event.locals.user) {
            return redirect(303, '/signin');
        }

        const formData = await event.request.formData();
        const templateId = formData.get('templateId') as string;

        if (!templateId) {
            return fail(400, { error: 'Template ID is required' });
        }

        // Verify the template belongs to the user
        const template = await event.locals.db.query.workTemplate.findFirst({
            where: eq(workTemplate.id, templateId)
        });

        if (!template) {
            return fail(404, { error: 'Template not found' });
        }

        if (template.userId !== event.locals.user.id) {
            return fail(403, { error: 'Not authorized to delete this template' });
        }

        try {
            // Delete the template (materials will be cascade deleted)
            await event.locals.db.delete(workTemplate).where(eq(workTemplate.id, templateId));
            return { success: true };
        } catch (err) {
            console.error(err);
            return fail(500, { error: 'Failed to delete template' });
        }
    }
};
