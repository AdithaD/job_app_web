import { createAuthClient } from "better-auth/svelte";

export const { signIn, signOut, signUp, useSession } = createAuthClient({ baseURL: process.env.BETTER_AUTH_URL })