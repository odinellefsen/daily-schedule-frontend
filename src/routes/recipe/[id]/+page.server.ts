import type { PageServerLoad, Actions } from './$types';
import type { FullRecipe, CreateIngredientsRequest, CreateInstructionsRequest, ApiResponse } from '$lib/types/recipe';
import { env } from '$env/dynamic/private';

const API_BASE = (env.DAILY_SCHEDULER_API_BASE as string | undefined) ?? 'http://localhost:3005';

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

    // Handle 404 case gracefully (endpoint not implemented yet)
    if (response.status === 404) {
      console.log('Recipe API endpoints not implemented yet (404).');
      recipe = null;
      error = 'Recipe functionality is not yet available. The API endpoints are still being implemented.';
      return {
        isAuthed: true,
        recipe,
        error
      };
    }

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
      console.log('🥕 Add ingredients action called for recipe:', params.id);
      
      if (!locals.session || !locals.authToken) {
        console.log('❌ Not authenticated for ingredients');
        return { success: false, error: 'Not authenticated' };
      }

      const token = locals.authToken;

      const formData = await request.formData();
      console.log('📝 Ingredients form data received:', Object.fromEntries(formData.entries()));
      
      const ingredientEntries = formData.getAll('ingredientText') as string[];
      console.log('🔍 Raw ingredient entries:', ingredientEntries);
      
      const ingredients = ingredientEntries
        .filter(text => text.trim())
        .map((text, index) => ({
          ingredientText: text.trim(),
          sortOrder: index + 1
        }));

      console.log('🍳 Processed ingredients to send:', ingredients);

      if (ingredients.length === 0) {
        console.log('❌ No valid ingredients found');
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

      console.log('🌐 Ingredients API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE}/api/recipe/ingredients`
      });

      const responseText = await response.text();
      console.log('📄 Ingredients API Response Text:', responseText);

      let body: ApiResponse;
      try {
        body = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse ingredients response as JSON:', parseError);
        return { 
          success: false, 
          error: `API returned invalid JSON. Status: ${response.status}, Response: ${responseText.slice(0, 200)}...`
        };
      }

      if (!response.ok || !body.success) {
        console.log('❌ Ingredients creation failed:', body);
        return { 
          success: false, 
          error: body.message || 'Failed to add ingredients',
          errors: body.errors 
        };
      }

      console.log('✅ Ingredients added successfully:', body.data);
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
      console.log('📋 Add instructions action called for recipe:', params.id);
      
      if (!locals.session || !locals.authToken) {
        console.log('❌ Not authenticated for instructions');
        return { success: false, error: 'Not authenticated' };
      }

      const token = locals.authToken;

      const formData = await request.formData();
      console.log('📝 Instructions form data received:', Object.fromEntries(formData.entries()));
      
      const instructionEntries = formData.getAll('stepInstruction') as string[];
      console.log('🔍 Raw instruction entries:', instructionEntries);
      
      const stepByStepInstructions = instructionEntries
        .filter(instruction => instruction.trim())
        .map((instruction, index) => ({
          stepNumber: index + 1,
          stepInstruction: instruction.trim()
        }));

      console.log('📚 Processed instructions to send:', stepByStepInstructions);

      if (stepByStepInstructions.length === 0) {
        console.log('❌ No valid instructions found');
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

      console.log('🌐 Instructions API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_BASE}/api/recipe/instructions`
      });

      const responseText = await response.text();
      console.log('📄 Instructions API Response Text:', responseText);

      let body: ApiResponse;
      try {
        body = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse instructions response as JSON:', parseError);
        return { 
          success: false, 
          error: `API returned invalid JSON. Status: ${response.status}, Response: ${responseText.slice(0, 200)}...`
        };
      }

      if (!response.ok || !body.success) {
        console.log('❌ Instructions creation failed:', body);
        return { 
          success: false, 
          error: body.message || 'Failed to add instructions',
          errors: body.errors 
        };
      }

      console.log('✅ Instructions added successfully:', body.data);
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
