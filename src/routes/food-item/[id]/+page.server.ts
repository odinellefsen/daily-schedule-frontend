import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

type Unit = {
    id: string;
    foodItemId: string;
    foodItemName?: string;
    unitOfMeasurement: string;
    unitDescription?: string;
    calories?: number;
    proteinInGrams?: number;
    carbohydratesInGrams?: number;
    fatInGrams?: number;
};

type FoodItem = {
    id: string;
    foodItemName: string;
    categoryHierarchy?: string[] | null;
};
type ApiResponse<T> = { success: boolean; message?: string; data?: T };

export const load: PageServerLoad = async ({ fetch, params, locals, url }) => {
    const apiBase =
        (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
        "http://localhost:3005";
    const isAuthed = Boolean(locals.session);
    const id = params.id;

    if (!isAuthed) {
        return { isAuthed, item: null as FoodItem | null, units: [] as Unit[] };
    }

    try {
        const [itemRes, unitsRes] = await Promise.all([
            fetch(`${apiBase}/api/food-item`, {
                headers: locals.authToken
                    ? {
                          Authorization: `Bearer ${locals.authToken}`,
                          "Content-Type": "application/json",
                      }
                    : { "Content-Type": "application/json" },
            }),
            fetch(`${apiBase}/api/food-item/${id}/units`, {
                headers: locals.authToken
                    ? {
                          Authorization: `Bearer ${locals.authToken}`,
                          "Content-Type": "application/json",
                      }
                    : { "Content-Type": "application/json" },
            }),
        ]);

        const itemApi = (await itemRes.json().catch(() => null)) as ApiResponse<
            FoodItem[]
        > | null;
        const unitsApi = (await unitsRes
            .json()
            .catch(() => null)) as ApiResponse<Unit[]> | null;

        const itemList = itemApi?.data ?? [];
        let item = itemList.find((f) => f.id === id) ?? null;
        const units = unitsApi?.data ?? [];

        const hintedName = url.searchParams.get("name");
        if (hintedName) {
            if (item) item.foodItemName = hintedName;
            else item = { id, foodItemName: hintedName } as FoodItem;
        } else if (!item && units.length && units[0]?.foodItemName) {
            item = { id, foodItemName: units[0].foodItemName! } as FoodItem;
        }

        const title =
            item?.foodItemName ??
            hintedName ??
            (units.length ? (units[0]?.foodItemName ?? null) : null);

        return { isAuthed, item, units, title };
    } catch {
        return { isAuthed, item: null as FoodItem | null, units: [] as Unit[] };
    }
};

export const actions: Actions = {
    addUnit: async ({ request, locals, params, fetch }) => {
        const apiBase =
            (env.DAILY_SCHEDULER_API_BASE as string | undefined) ??
            "http://localhost:3005";
        if (!locals.session || !locals.authToken) {
            return fail(401, { message: "Please sign in to add units." });
        }

        const form = await request.formData();
        const unitOfMeasurement = String(
            form.get("unitOfMeasurement") || ""
        ).trim();
        const unitDescription =
            String(form.get("unitDescription") || "").trim() || undefined;
        const calories = form.get("calories")
            ? Number(form.get("calories"))
            : undefined;
        const proteinInGrams = form.get("proteinInGrams")
            ? Number(form.get("proteinInGrams"))
            : undefined;
        const carbohydratesInGrams = form.get("carbohydratesInGrams")
            ? Number(form.get("carbohydratesInGrams"))
            : undefined;
        const fatInGrams = form.get("fatInGrams")
            ? Number(form.get("fatInGrams"))
            : undefined;

        if (!unitOfMeasurement) {
            return fail(400, { message: "Unit of measurement is required." });
        }

        const payload = {
            units: [
                {
                    unitOfMeasurement,
                    unitDescription,
                    calories,
                    proteinInGrams,
                    carbohydratesInGrams,
                    fatInGrams,
                },
            ],
        };

        const res = await fetch(`${apiBase}/api/food-item/${params.id}/units`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${locals.authToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            return fail(res.status || 500, {
                message: body || "Failed to add units",
            });
        }

        throw redirect(303, `/food-item/${params.id}`);
    },
};
