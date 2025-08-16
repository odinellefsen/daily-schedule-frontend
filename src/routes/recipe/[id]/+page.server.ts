import type { PageServerLoad, Actions } from './$types';
import type { FullRecipe, CreateIngredientsRequest, CreateInstructionsRequest, ApiResponse } from '$lib/types/recipe';

const API_BASE = 'http://localhost:8787'; // Update this to match your API base URL

export const load: PageServerLoad = async ({ params, locals }) => {
  let recipe: FullRecipe | null = null;
  let error: string | null = null;

  // Check if user is authenticated
  const isAuthed = !!locals.auth;
  
  if (!isAuthed) {
    return {
      isAuthed: false,
      recipe: null,
      error: 'Authentication required'
    };
  }

  try {
    const token = await locals.auth?.getToken();
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
      const token = await locals.auth?.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

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
      const token = await locals.auth?.getToken();
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

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
