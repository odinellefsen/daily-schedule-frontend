import type { PageServerLoad } from "./$types";
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

        console.log(res);

        if (!res.ok) {
            return {
                todos: [] as Todo[],
                counts: { total: 0, completed: 0, remaining: 0, overdue: 0 },
                isAuthed,
            } satisfies TodayResponse & { isAuthed: boolean };
        }

        const data = (await res.json()) as TodayResponse;
        if (data.counts.total === 0) {
            return {
                todos: [
                    {
                        id: "1",
                        description: "Test todo",
                        scheduledFor: new Date(
                            Date.now() + 1000 * 60 * 60 * 24
                        ).toISOString(),
                        completed: false,
                        context: {
                            type: "standalone",
                        },
                        urgency: "now",
                        canStartNow: true,
                        isOverdue: false,
                    },
                ] as Todo[],
                counts: { total: 1, completed: 0, remaining: 0, overdue: 0 },
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
            counts: { total: 0, completed: 0, remaining: 0, overdue: 0 },
            isAuthed,
        } satisfies TodayResponse & { isAuthed: boolean };
    }
};
