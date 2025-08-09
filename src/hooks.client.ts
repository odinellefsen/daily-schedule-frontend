import type { HandleClientError } from "@sveltejs/kit";
import { initializeClerkClient } from "clerk-sveltekit/client";
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from "$env/static/public";

initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY, {
    afterSignInUrl: "/",
    afterSignUpUrl: "/",
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
});

export const handleError: HandleClientError = async ({ error }) => {
    console.error(error);
};
