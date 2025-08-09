import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        // Proxy Clerk cookies when dev server is on a different origin than the Clerk domain
        // to reduce sign-in state loss due to cross-origin issues during dev.
        proxy: {},
    },
});
