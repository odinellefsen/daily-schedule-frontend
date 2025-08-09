import type { HandleClientError } from "@sveltejs/kit";
import { initializeClerkClient } from "clerk-sveltekit/client";

initializeClerkClient(import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY, {
    afterSignInUrl: "/",
    afterSignUpUrl: "/",
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
});

export const handleError: HandleClientError = async ({ error }) => {
    console.error(error);
};
