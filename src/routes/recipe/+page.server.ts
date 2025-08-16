import type { PageServerLoad, Actions } from './$types';
import type { RecipeListItem, CreateRecipeRequest, ApiResponse } from '$lib/types/recipe';

import { env } from '$env/dynamic/private';

const API_BASE = (env.DAILY_SCHEDULER_API_BASE as string | undefined) ?? 'http://localhost:8787';

export const load: PageServerLoad = async ({ locals, url }) => {
  let recipes: RecipeListItem[] = [];
  let error: string | null = null;

  // Check if user is authenticated
  const isAuthed = Boolean(locals.session);
  
  if (!isAuthed) {
    return {
      isAuthed: false,
      recipes: [],
      error: null
    };
  }

  try {
    const token = locals.authToken;
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Get search parameters
    const searchQuery = url.searchParams.get('q');
    const timing = url.searchParams.get('timing');

    // Build the API URL
    let apiUrl = `${API_BASE}/api/recipe/`;
    if (searchQuery || timing) {
      apiUrl = `${API_BASE}/api/recipe/search?`;
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (timing) params.append('timing', timing);
      apiUrl += params.toString();
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const body: ApiResponse<RecipeListItem[]> = await response.json();

    if (!response.ok || !body.success) {
      throw new Error(body.message || 'Failed to fetch recipes');
    }

    recipes = body.data || [];
  } catch (err) {
    console.error('Error loading recipes:', err);
    error = err instanceof Error ? err.message : 'Failed to load recipes';
  }

  return {
    isAuthed: true,
    recipes,
    error,
    searchQuery: url.searchParams.get('q'),
    timing: url.searchParams.get('timing')
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    try {
      if (!locals.session || !locals.authToken) {
        return { success: false, error: 'Not authenticated' };
      }

      const token = locals.authToken;

      const formData = await request.formData();
      const createData: CreateRecipeRequest = {
        nameOfTheRecipe: formData.get('nameOfTheRecipe') as string,
        generalDescriptionOfTheRecipe: formData.get('generalDescriptionOfTheRecipe') as string || undefined,
        whenIsItConsumed: formData.getAll('whenIsItConsumed') as any[] || undefined
      };

      const response = await fetch(`${API_BASE}/api/recipe/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData)
      });

      const body: ApiResponse = await response.json();

      if (!response.ok || !body.success) {
        return { 
          success: false, 
          error: body.message || 'Failed to create recipe',
          errors: body.errors 
        };
      }

      return { 
        success: true, 
        recipe: body.data,
        message: 'Recipe created successfully' 
      };
    } catch (err) {
      console.error('Error creating recipe:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create recipe' 
      };
    }
  }
};
