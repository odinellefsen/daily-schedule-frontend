import type { Actions, PageServerLoad } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

type Todo = {
    id: string;
    description: string;
    scheduledFor: string;
    completed: boolean;
    context: {
        type: "meal" | "standalone";
        mealName?: string;
        stepNumber?: number;
        estimatedDuration?: number;
    };
    urgency: "overdue" | "now" | "upcoming" | "later";
    canStartNow: boolean;
    isOverdue: boolean;
};

type TodayResponse = {
    todos: Todo[];
    counts: {
        total: number;
        completed: number;
        remaining: number;
        overdue: number;
    };
};

const urgencyOrder: Record<Todo["urgency"], number> = {
    overdue: 0,
    now: 1,
    upcoming: 2,
    later: 3,
};

export const load: PageServerLoad = async ({ fetch, locals }) => {
    const apiBase =
        (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
        "http://localhost:3005";

    const isAuthed = Boolean(locals.session);

    // If not authenticated yet, don't ping the API; return empty state
    if (!isAuthed) {
        return {
            todos: [] as Todo[],
            counts: { total: 0, completed: 0, remaining: 0, overdue: 0 },
            isAuthed,
        } satisfies TodayResponse & { isAuthed: boolean };
    }

    try {
        const res = await fetch(`${apiBase}/api/todo/today`, {
            headers: locals.authToken
                ? {
                      Authorization: `Bearer ${locals.authToken}`,
                      "Content-Type": "application/json",
                  }
                : { "Content-Type": "application/json" },
        });

        const api = (await res.json().catch(() => null)) as {
            success: boolean;
            message?: string;
            data?: TodayResponse;
        } | null;

        if (!res.ok || !api || api.success === false || !api.data) {
            return {
                todos: [],
                counts: { total: 1, completed: 0, remaining: 1, overdue: 0 },
                isAuthed,
            } satisfies TodayResponse & { isAuthed: boolean };
        }

        const data = api.data as TodayResponse;
        if (!data.todos || data.todos.length === 0) {
            return {
                todos: [] as Todo[],
                counts: { total: 1, completed: 0, remaining: 1, overdue: 0 },
                isAuthed,
            } satisfies TodayResponse & { isAuthed: boolean };
        }

        const sorted = [...data.todos].sort(
            (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        );

        return {
            todos: sorted,
            counts: data.counts,
            isAuthed,
        } satisfies TodayResponse & { isAuthed: boolean };
    } catch {
        return {
            todos: [] as Todo[],
            counts: { total: 1, completed: 0, remaining: 1, overdue: 0 },
            isAuthed,
        } satisfies TodayResponse & { isAuthed: boolean };
    }
};

export const actions: Actions = {
    default: async ({ request, locals, fetch }) => {
        console.log("Server action called!");
        const apiBase =
            (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
            "http://localhost:3005";

        if (!locals.session || !locals.authToken) {
            console.log("Not authenticated:", {
                session: !!locals.session,
                authToken: !!locals.authToken,
            });
            return fail(401, { message: "Please sign in to add todos." });
        }

        const form = await request.formData();
        console.log("Form data:", Array.from(form.entries()));
        const description = String(form.get("description") || "").trim();
        const scheduledRaw = form.get("scheduledFor");
        const scheduledFor = scheduledRaw
            ? new Date(String(scheduledRaw)).toISOString()
            : undefined;

        if (!description) {
            return fail(400, { message: "Description is required." });
        }

        const payload = {
            description,
            scheduledFor,
            userId: locals.session.userId,
        };

        console.log("Making API call to:", `${apiBase}/api/todo`);
        console.log("Payload:", payload);

        const res = await fetch(`${apiBase}/api/todo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${locals.authToken}`,
            },
            body: JSON.stringify(payload),
        });

        console.log("API response status:", res.status);

        if (!res.ok) {
            const errorBody = await res.text();
            console.log("API error response:", errorBody);
            return fail(res.status, {
                message: `Failed to create todo: ${res.status}`,
            });
        }

        throw redirect(303, "/");
    },
};
