import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { getDb } from './lib/server/db';
import { getAuth } from '$lib/server/auth';
import { S3Client } from '@aws-sdk/client-s3';

const handler: Handle = async ({ event, resolve }) => {

	event.locals.db = getDb(event.platform?.env.job_app_db, event.platform?.env.DATABASE_URL);

	if (!event.platform) throw Error("Platform details missing");

	event.locals.storage = new S3Client({
		region: "auto",
		endpoint: event.platform?.env.R2_URL,
		credentials: {
			accessKeyId: event.platform?.env.R2_KEY_ID,
			secretAccessKey: event.platform?.env.R2_SECRET_ACCESS_KEY
		}
	});

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
