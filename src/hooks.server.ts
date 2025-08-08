import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { handleClerk } from "clerk-sveltekit/server";
import { env } from "$env/dynamic/private";

const clerkHandle = handleClerk(env.CLERK_SECRET_KEY ?? "", {
    debug: false,
    protectedPaths: [],
    signInUrl: "/sign-in",
}) as Handle;

export const handle: Handle = sequence(
    clerkHandle,
    async ({ event, resolve }) => {
        const sessionToken = event.cookies.get("__session") ?? null;
        event.locals.authToken = sessionToken;
        return resolve(event);
    }
);
