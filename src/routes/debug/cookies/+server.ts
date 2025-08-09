import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals }) => {
    const names = cookies.getAll().map((c) => c.name);
    const session = cookies.get("__session");
    return new Response(
        JSON.stringify({
            hasSessionCookie: Boolean(session),
            sessionCookiePreview: session ? session.slice(0, 16) + "…" : null,
            cookieNames: names,
            serverSeesSession: Boolean(locals.session),
        }),
        { headers: { "Content-Type": "application/json" } }
    );
};
