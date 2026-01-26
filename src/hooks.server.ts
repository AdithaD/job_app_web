import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { getDb } from './lib/server/db';
import { getAuth } from '$lib/server/auth';

const handler: Handle = async ({ event, resolve }) => {

	event.locals.db = getDb(event.platform?.env.job_app_db, event.platform?.env.DATABASE_URL);


	event.locals.auth = getAuth(event.locals.db);

	const session = await event.locals.auth.api.getSession({
		headers: event.request.headers,
	});

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth: event.locals.auth, building });
};

export const handle: Handle = handler;
