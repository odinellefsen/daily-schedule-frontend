import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

type FoodItem = {
    id: string;
    foodItemName: string;
    categoryHierarchy?: string[] | null;
    unitCount?: number;
    hasUnits?: boolean;
};

type ApiResponse<T> = { success: boolean; message?: string; data?: T };

function parseCategoryPath(
    input: string | null | undefined
): string[] | undefined {
    if (!input) return undefined;
    const parts = input
        .split(/>|\||\//)
        .map((s) => s.trim())
        .filter(Boolean);
    return parts.length ? parts : undefined;
}

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
    const apiBase =
        (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
        "http://localhost:3005";

    const isAuthed = Boolean(locals.session);
    if (!isAuthed) {
        return {
            isAuthed,
            items: [] as FoodItem[],
            topCategories: [] as string[],
            baseItems: [] as FoodItem[],
        };
    }

    try {
        const res = await fetch(`${apiBase}/api/food-item`, {
            headers: locals.authToken
                ? {
                      Authorization: `Bearer ${locals.authToken}`,
                      "Content-Type": "application/json",
                  }
                : { "Content-Type": "application/json" },
        });

        const api = (await res.json().catch(() => null)) as ApiResponse<
            Array<FoodItem & { name?: string }>
        > | null;
        console.log("[food-item] GET /api/food-item status=", res.status);
        console.log("[food-item] GET /api/food-item body=", api);
        if (!res.ok || !api || api.success === false || !api.data) {
            return { isAuthed, items: [], topCategories: [], baseItems: [] };
        }

        // Normalize API shape: backend returns `name`, our UI uses `foodItemName`
        const items: FoodItem[] = (
            api.data as Array<FoodItem & { name?: string }>
        ).map((it) => ({
            id: it.id,
            foodItemName: (it as any).foodItemName ?? it.name ?? "",
            categoryHierarchy: it.categoryHierarchy ?? null,
            unitCount: it.unitCount,
            hasUnits: it.hasUnits,
        }));

        const currentPath =
            parseCategoryPath(url.searchParams.get("path")) ?? [];

        // items that match current path prefix
        const scoped = items.filter((it) => {
            const h = it.categoryHierarchy ?? [];
            if (currentPath.length === 0) return true;
            if (h.length < currentPath.length) return false;
            for (let i = 0; i < currentPath.length; i += 1) {
                if ((h[i] || "") !== currentPath[i]) return false;
            }
            return true;
        });

        const levelItems = scoped.filter(
            (it) => (it.categoryHierarchy ?? []).length === currentPath.length
        );

        const topCategories =
            currentPath.length === 0
                ? Array.from(
                      new Set(
                          items.flatMap((it) =>
                              it.categoryHierarchy?.[0]
                                  ? [it.categoryHierarchy[0]]
                                  : []
                          )
                      )
                  ).sort((a, b) => a.localeCompare(b))
                : [];

        return {
            isAuthed,
            currentPath,
            levelItems,
            topCategories,
        };
    } catch {
        return { isAuthed, items: [], topCategories: [], baseItems: [] };
    }
};

export const actions: Actions = {
    default: async ({ request, locals, fetch }) => {
        const apiBase =
            (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
            "http://localhost:3005";

        if (!locals.session || !locals.authToken) {
            return fail(401, {
                message: "Please sign in to create food items.",
            });
        }

        const form = await request.formData();
        const foodItemName = String(form.get("foodItemName") || "").trim();
        const categoryPathRaw = String(form.get("categoryPath") || "").trim();
        const categoryHierarchy = parseCategoryPath(categoryPathRaw);

        if (!foodItemName) {
            return fail(400, { message: "Food item name is required." });
        }

        const payload: Record<string, unknown> = { foodItemName };
        if (categoryHierarchy) payload.categoryHierarchy = categoryHierarchy;

        const res = await fetch(`${apiBase}/api/food-item`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${locals.authToken}`,
            },
            body: JSON.stringify(payload),
        });

        const api = (await res
            .json()
            .catch(() => null)) as ApiResponse<FoodItem> | null;
        if (!res.ok || !api || api.success === false || !api.data) {
            return fail(res.status || 500, {
                message: api?.message || "Failed to create food item",
            });
        }

        const name = encodeURIComponent(api.data.foodItemName);
        throw redirect(303, `/food-item/${api.data.id}?name=${name}`);
    },
};
