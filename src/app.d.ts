// See https://svelte.dev/docs/kit/types#app.d.ts

import type { DrizzleClient } from "$lib/server/db";
import type { Session, User } from "better-auth";
import type { BetterAuth } from "$lib/auth";

// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env
			cf: CfProperties
			ctx: ExecutionContext
		}
		interface Locals {
			db: DrizzleClient,
			storage: S3Client,
			auth: BetterAuth,
			user: User | null,
			session: Session | null,
		}
	} // interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export { };
