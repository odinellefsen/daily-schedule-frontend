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
            Array<FoodItem & { name?: string }>
        > | null;
        const unitsApi = (await unitsRes
            .json()
            .catch(() => null)) as ApiResponse<Unit[]> | null;

        const itemList: FoodItem[] = (itemApi?.data ?? []).map((it: any) => ({
            id: it.id,
            foodItemName: it.foodItemName ?? it.name ?? "",
            categoryHierarchy: it.categoryHierarchy ?? null,
        }));
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

        // Get the food item name from existing units or by fetching the food item
        let foodItemName = "";

        // Try to get food item name from existing units first
        const unitsRes = await fetch(
            `${apiBase}/api/food-item/${params.id}/units`,
            {
                headers: {
                    Authorization: `Bearer ${locals.authToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (unitsRes.ok) {
            const unitsApi = await unitsRes.json().catch(() => null);
            const units = unitsApi?.data ?? [];
            if (units.length > 0) {
                foodItemName = units[0]?.foodItemName ?? "";
            }
        }

        // If no units exist, get the name from the food item list
        if (!foodItemName) {
            const itemRes = await fetch(`${apiBase}/api/food-item`, {
                headers: {
                    Authorization: `Bearer ${locals.authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (itemRes.ok) {
                const itemApi = await itemRes.json().catch(() => null);
                const itemList = itemApi?.data ?? [];
                const item = itemList.find((f: any) => f.id === params.id);
                foodItemName = item?.foodItemName ?? item?.name ?? "";
            }
        }

        if (!foodItemName) {
            return fail(400, { message: "Food item not found." });
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
            foodItemName,
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

        console.log(
            `[add-unit] POST ${apiBase}/api/food-item/${params.id}/units`
        );
        console.log(`[add-unit] Payload:`, JSON.stringify(payload, null, 2));

        const res = await fetch(`${apiBase}/api/food-item/${params.id}/units`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${locals.authToken}`,
            },
            body: JSON.stringify(payload),
        });

        console.log(`[add-unit] Response status: ${res.status}`);

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.log(`[add-unit] Error response:`, body);
            return fail(res.status || 500, {
                message: body || "Failed to add units",
            });
        }

        const responseBody = await res.json().catch(() => null);
        console.log(`[add-unit] Success response:`, responseBody);

        throw redirect(303, `/food-item/${params.id}`);
    },
};
