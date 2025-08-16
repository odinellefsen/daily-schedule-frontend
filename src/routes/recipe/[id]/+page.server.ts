import type { PageServerLoad, Actions } from './$types';
import type { FullRecipe, CreateIngredientsRequest, CreateInstructionsRequest, ApiResponse } from '$lib/types/recipe';
import { env } from '$env/dynamic/private';

const API_BASE = (env.DAILY_SCHEDULER_API_BASE as string | undefined) ?? 'http://localhost:8787';

export const load: PageServerLoad = async ({ params, locals }) => {
  let recipe: FullRecipe | null = null;
  let error: string | null = null;

  // Check if user is authenticated
  const isAuthed = Boolean(locals.session);
  
  if (!isAuthed) {
    return {
      isAuthed: false,
      recipe: null,
      error: 'Authentication required'
    };
  }

  try {
    const token = locals.authToken;
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API_BASE}/api/recipe/${params.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const body: ApiResponse<FullRecipe> = await response.json();

    if (!response.ok || !body.success) {
      throw new Error(body.message || 'Failed to fetch recipe');
    }

    recipe = body.data || null;
  } catch (err) {
    console.error('Error loading recipe:', err);
    error = err instanceof Error ? err.message : 'Failed to load recipe';
  }

  return {
    isAuthed: true,
    recipe,
    error,
    recipeId: params.id
  };
};

export const actions: Actions = {
  addIngredients: async ({ request, locals, params }) => {
    try {
      if (!locals.session || !locals.authToken) {
        return { success: false, error: 'Not authenticated' };
      }

      const token = locals.authToken;

      const formData = await request.formData();
      const ingredientEntries = formData.getAll('ingredientText') as string[];
      
      const ingredients = ingredientEntries
        .filter(text => text.trim())
        .map((text, index) => ({
          ingredientText: text.trim(),
          sortOrder: index + 1
        }));

      if (ingredients.length === 0) {
        return { success: false, error: 'At least one ingredient is required' };
      }

      const requestData: CreateIngredientsRequest = {
        recipeId: params.id!,
        ingredients
      };

      const response = await fetch(`${API_BASE}/api/recipe/ingredients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const body: ApiResponse = await response.json();

      if (!response.ok || !body.success) {
        return { 
          success: false, 
          error: body.message || 'Failed to add ingredients',
          errors: body.errors 
        };
      }

      return { 
        success: true, 
        message: 'Ingredients added successfully' 
      };
    } catch (err) {
      console.error('Error adding ingredients:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add ingredients' 
      };
    }
  },

  addInstructions: async ({ request, locals, params }) => {
    try {
      if (!locals.session || !locals.authToken) {
        return { success: false, error: 'Not authenticated' };
      }

      const token = locals.authToken;

      const formData = await request.formData();
      const instructionEntries = formData.getAll('stepInstruction') as string[];
      
      const stepByStepInstructions = instructionEntries
        .filter(instruction => instruction.trim())
        .map((instruction, index) => ({
          stepNumber: index + 1,
          stepInstruction: instruction.trim()
        }));

      if (stepByStepInstructions.length === 0) {
        return { success: false, error: 'At least one instruction step is required' };
      }

      const requestData: CreateInstructionsRequest = {
        recipeId: params.id!,
        stepByStepInstructions
      };

      const response = await fetch(`${API_BASE}/api/recipe/instructions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const body: ApiResponse = await response.json();

      if (!response.ok || !body.success) {
        return { 
          success: false, 
          error: body.message || 'Failed to add instructions',
          errors: body.errors 
        };
      }

      return { 
        success: true, 
        message: 'Instructions added successfully' 
      };
    } catch (err) {
      console.error('Error adding instructions:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to add instructions' 
      };
    }
  }
};
