import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DrizzleClient } from "./db";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";

export function getAuth(db: DrizzleClient) {
    return betterAuth({
        database: drizzleAdapter(db, {
            provider: "sqlite", // or "mysql", "sqlite"
        }),
        emailAndPassword: {
            enabled: true,
        },
        plugins: [sveltekitCookies(getRequestEvent)]
    });
}

export type BetterAuth = ReturnType<typeof getAuth>;