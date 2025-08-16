<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { FullRecipe, RecipeTimingType } from '$lib/types/recipe';

  export let data: {
    isAuthed: boolean;
    recipe: FullRecipe | null;
    error: string | null;
    recipeId: string;
  };

  let showAddIngredients = false;
  let showAddInstructions = false;
  let ingredientInputs: string[] = [''];
  let instructionInputs: string[] = [''];

  const timingOptions: { value: RecipeTimingType; label: string; icon: string; color: string }[] = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '☀️', color: 'var(--color-warning)' },
    { value: 'LUNCH', label: 'Lunch', icon: '🌞', color: 'var(--color-accent)' },
    { value: 'DINNER', label: 'Dinner', icon: '🌙', color: 'var(--color-secondary)' },
    { value: 'SNACK', label: 'Snack', icon: '🍎', color: 'var(--color-danger)' }
  ];

  function getTimingInfo(timing: RecipeTimingType) {
    return timingOptions.find(t => t.value === timing) || { label: timing, icon: '🍽️', color: 'var(--color-text-muted)' };
  }

  function addIngredientInput() {
    ingredientInputs = [...ingredientInputs, ''];
  }

  function removeIngredientInput(index: number) {
    if (ingredientInputs.length > 1) {
      ingredientInputs = ingredientInputs.filter((_, i) => i !== index);
    }
  }

  function addInstructionInput() {
    instructionInputs = [...instructionInputs, ''];
  }

  function removeInstructionInput(index: number) {
    if (instructionInputs.length > 1) {
      instructionInputs = instructionInputs.filter((_, i) => i !== index);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  $: recipe = data.recipe;
  $: hasIngredients = recipe?.ingredients && recipe.ingredients.length > 0;
  $: hasInstructions = recipe?.instructions && recipe.instructions.length > 0;
  $: isComplete = hasIngredients && hasInstructions;
</script>

<div class="container">
  {#if data.error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Recipe not found</h2>
      <p class="error-text">{data.error}</p>
      <a href="/recipe" class="error-back">← Back to recipes</a>
    </div>
  {:else if !data.isAuthed}
    <div class="auth-required">
      <div class="auth-icon">🔒</div>
      <h2 class="auth-title">Authentication required</h2>
      <p class="auth-text">Please sign in to view this recipe.</p>
      <a href="/sign-in" class="auth-cta">Sign in</a>
    </div>
  {:else if !recipe}
    <div class="loading-state">
      <div class="loading-icon">⏳</div>
      <h2 class="loading-title">Loading recipe...</h2>
    </div>
  {:else}
    <header class="page-header">
      <div class="header-content">
        <div class="header-main">
          <a href="/recipe" class="back-btn" aria-label="Back to recipes">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </a>
          <div class="recipe-info">
            <h1 class="recipe-title">{recipe.nameOfTheRecipe}</h1>
            <div class="recipe-status" class:complete={isComplete}>
              {isComplete ? '✅ Complete' : '⏳ In Progress'}
            </div>
          </div>
        </div>
        
        <div class="completion-progress">
          <div class="progress-ring">
            <svg class="progress-circle" viewBox="0 0 36 36">
              <path
                class="progress-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="progress-fill"
                stroke-dasharray="{(hasIngredients ? 50 : 0) + (hasInstructions ? 50 : 0)}, 100"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="progress-text">
              {hasIngredients && hasInstructions ? '100' : hasIngredients || hasInstructions ? '50' : '0'}%
            </div>
          </div>
        </div>
      </div>

      {#if recipe.generalDescriptionOfTheRecipe}
        <p class="recipe-description">{recipe.generalDescriptionOfTheRecipe}</p>
      {/if}

      {#if recipe.whenIsItConsumed?.length}
        <div class="recipe-timing">
          {#each recipe.whenIsItConsumed as timing}
            {@const timingInfo = getTimingInfo(timing)}
            <span class="timing-badge" style="background-color: {timingInfo.color}">
              {timingInfo.icon} {timingInfo.label}
            </span>
          {/each}
        </div>
      {/if}

      {#if recipe.createdAt}
        <div class="recipe-meta">
          <span>Created {formatDate(recipe.createdAt)}</span>
          {#if recipe.updatedAt && recipe.updatedAt !== recipe.createdAt}
            <span>Updated {formatDate(recipe.updatedAt)}</span>
          {/if}
        </div>
      {/if}
    </header>

    <div class="recipe-content">
      <!-- Ingredients Section -->
      <section class="recipe-section">
        <div class="section-header">
          <h2 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Ingredients
          </h2>
          {#if !hasIngredients}
            <button class="add-section-btn" on:click={() => (showAddIngredients = true)} aria-label="Add ingredients">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          {/if}
        </div>

        {#if hasIngredients}
          <ul class="ingredients-list">
            {#each recipe.ingredients || [] as ingredient, index}
              <li class="ingredient-item">
                <span class="ingredient-number">{ingredient.sortOrder}</span>
                <span class="ingredient-text">{ingredient.ingredientText}</span>
              </li>
            {/each}
          </ul>
          <button class="add-more-btn" on:click={() => (showAddIngredients = true)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add more ingredients
          </button>
        {:else}
          <div class="empty-section">
            <div class="empty-icon">📝</div>
            <p class="empty-text">No ingredients added yet</p>
            <button class="empty-cta" on:click={() => (showAddIngredients = true)}>
              Add ingredients
            </button>
          </div>
        {/if}
      </section>

      <!-- Instructions Section -->
      <section class="recipe-section">
        <div class="section-header">
          <h2 class="section-title">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            Instructions
          </h2>
          {#if !hasInstructions}
            <button class="add-section-btn" on:click={() => (showAddInstructions = true)} aria-label="Add instructions">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          {/if}
        </div>

        {#if hasInstructions}
          <ol class="instructions-list">
            {#each (recipe.instructions || []).sort((a, b) => a.stepNumber - b.stepNumber) as instruction}
              <li class="instruction-item">
                <span class="instruction-number">{instruction.stepNumber}</span>
                <div class="instruction-content">
                  <p class="instruction-text">{instruction.stepInstruction}</p>
                  {#if instruction.ingredientsUsedInStep?.length}
                    <div class="step-ingredients">
                      <span class="step-ingredients-label">Ingredients for this step:</span>
                      <!-- Note: This would need additional API data to show ingredient details -->
                      <span class="step-ingredients-count">{instruction.ingredientsUsedInStep.length} items</span>
                    </div>
                  {/if}
                </div>
              </li>
            {/each}
          </ol>
          <button class="add-more-btn" on:click={() => (showAddInstructions = true)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add more steps
          </button>
        {:else}
          <div class="empty-section">
            <div class="empty-icon">📋</div>
            <p class="empty-text">No instructions added yet</p>
            <button class="empty-cta" on:click={() => (showAddInstructions = true)}>
              Add instructions
            </button>
          </div>
        {/if}
      </section>
    </div>
  {/if}

  <!-- Add Ingredients Modal -->
  {#if showAddIngredients}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add ingredients" on:click={() => (showAddIngredients = false)}>
      <div class="modal-content" role="document" on:click|stopPropagation>
        <form method="POST" action="?/addIngredients" class="modal-form" use:enhance={() => async ({ result }) => {
          if (result.type === 'success') {
            await invalidateAll();
            showAddIngredients = false;
            ingredientInputs = [''];
          }
        }}>
          <div class="modal-header">
            <h2 class="modal-title">Add Ingredients</h2>
            <button type="button" class="modal-close" on:click={() => (showAddIngredients = false)} aria-label="Close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="ingredients-input">
            {#each ingredientInputs as ingredient, index}
              <div class="ingredient-input-row">
                <span class="input-number">{index + 1}</span>
                <input 
                  type="text"
                  name="ingredientText"
                  bind:value={ingredientInputs[index]}
                  class="field-input"
                  placeholder="e.g., 2 chicken breasts"
                  required={index === 0}
                />
                {#if ingredientInputs.length > 1}
                  <button type="button" class="remove-input" on:click={() => removeIngredientInput(index)} aria-label="Remove ingredient">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
            
            <button type="button" class="add-input-btn" on:click={addIngredientInput}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add another ingredient
            </button>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => (showAddIngredients = false)}>Cancel</button>
            <button type="submit" class="btn btn-primary">Add Ingredients</button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Add Instructions Modal -->
  {#if showAddInstructions}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add instructions" on:click={() => (showAddInstructions = false)}>
      <div class="modal-content" role="document" on:click|stopPropagation>
        <form method="POST" action="?/addInstructions" class="modal-form" use:enhance={() => async ({ result }) => {
          if (result.type === 'success') {
            await invalidateAll();
            showAddInstructions = false;
            instructionInputs = [''];
          }
        }}>
          <div class="modal-header">
            <h2 class="modal-title">Add Instructions</h2>
            <button type="button" class="modal-close" on:click={() => (showAddInstructions = false)} aria-label="Close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="instructions-input">
            {#each instructionInputs as instruction, index}
              <div class="instruction-input-row">
                <span class="input-number">{index + 1}</span>
                <textarea 
                  name="stepInstruction"
                  bind:value={instructionInputs[index]}
                  class="field-textarea"
                  placeholder="e.g., Heat oil in a large pan over medium heat..."
                  rows="3"
                  required={index === 0}
                ></textarea>
                {#if instructionInputs.length > 1}
                  <button type="button" class="remove-input" on:click={() => removeInstructionInput(index)} aria-label="Remove instruction">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
            
            <button type="button" class="add-input-btn" on:click={addInstructionInput}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Add another step
            </button>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => (showAddInstructions = false)}>Cancel</button>
            <button type="submit" class="btn btn-primary">Add Instructions</button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--space-lg) var(--space-5xl);
    min-height: calc(100vh - var(--header-height));
    min-height: calc(100dvh - var(--header-height));
  }

  /* Page Header */
  .page-header {
    padding: var(--space-2xl) 0 var(--space-xl);
  }

  .header-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-lg);
    margin-bottom: var(--space-lg);
  }

  .header-main {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    flex: 1;
  }

  .back-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }

  .back-btn:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    transform: translateX(-2px);
  }

  .back-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .recipe-info {
    flex: 1;
  }

  .recipe-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0 0 var(--space-sm) 0;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  .recipe-status {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .recipe-status.complete {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: var(--color-text-inverse);
  }

  .completion-progress {
    flex-shrink: 0;
  }

  .progress-ring {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .progress-circle {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .progress-bg {
    fill: none;
    stroke: var(--color-border-light);
    stroke-width: 3;
  }

  .progress-fill {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray var(--animation-slow);
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .recipe-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-lg) 0;
  }

  .recipe-timing {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .timing-badge {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-inverse);
  }

  .recipe-meta {
    display: flex;
    gap: var(--space-lg);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  /* Recipe Content */
  .recipe-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-4xl);
  }

  .recipe-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2xl);
    padding: var(--space-xl);
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .section-icon {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
    color: var(--color-secondary);
  }

  .add-section-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    box-shadow: var(--shadow-sm);
  }

  .add-section-btn:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .add-section-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Ingredients List */
  .ingredients-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .ingredient-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
  }

  .ingredient-number {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: 600;
    flex-shrink: 0;
  }

  .ingredient-text {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  /* Instructions List */
  .instructions-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .instruction-item {
    display: flex;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
  }

  .instruction-number {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-full);
    background: var(--color-secondary);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-base);
    font-weight: 600;
    flex-shrink: 0;
    margin-top: var(--space-xs);
  }

  .instruction-content {
    flex: 1;
    min-width: 0;
  }

  .instruction-text {
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    line-height: 1.6;
    margin: 0 0 var(--space-sm) 0;
  }

  .step-ingredients {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .step-ingredients-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .step-ingredients-count {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-accent);
  }

  /* Add More Button */
  .add-more-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--animation-fast);
    margin-top: var(--space-lg);
    justify-content: center;
  }

  .add-more-btn:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .add-more-btn svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  /* Empty Section */
  .empty-section {
    text-align: center;
    padding: var(--space-4xl) var(--space-lg);
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: var(--space-lg);
    opacity: 0.5;
  }

  .empty-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-xl) 0;
  }

  .empty-cta {
    padding: var(--space-md) var(--space-xl);
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--animation-fast);
    border: 1px solid var(--color-primary);
  }

  .empty-cta:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
  }

  /* Error/Auth/Loading States */
  .error-state, .auth-required, .loading-state {
    text-align: center;
    padding: var(--space-5xl) var(--space-lg);
    margin-top: var(--space-4xl);
  }

  .error-icon, .auth-icon, .loading-icon {
    font-size: 3rem;
    margin-bottom: var(--space-xl);
    display: block;
  }

  .error-title, .auth-title, .loading-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md) 0;
  }

  .error-text, .auth-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-2xl) 0;
  }

  .error-back, .auth-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--animation-fast);
  }

  .error-back:hover, .auth-cta:hover {
    background: var(--color-primary-light);
    transform: translateY(-1px);
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    z-index: 50;
    animation: modalFadeIn var(--animation-normal);
  }

  @keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: var(--color-surface);
    border-radius: var(--radius-2xl);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: var(--shadow-xl);
    animation: modalSlideIn var(--animation-normal);
  }

  @keyframes modalSlideIn {
    from { 
      opacity: 0; 
      transform: translateY(20px) scale(0.95);
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-lg) 0;
  }

  .modal-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .modal-close {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: all var(--animation-fast);
  }

  .modal-close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  .modal-close svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .modal-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    overflow-y: auto;
  }

  /* Input Rows */
  .ingredients-input, .instructions-input {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .ingredient-input-row, .instruction-input-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .input-number {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: 600;
    flex-shrink: 0;
    margin-top: var(--space-md);
  }

  .instruction-input-row .input-number {
    background: var(--color-secondary);
    margin-top: var(--space-md);
  }

  .field-input, .field-textarea {
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-base);
    transition: all var(--animation-fast);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-family: inherit;
    resize: vertical;
  }

  .field-input:focus, .field-textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
  }

  .field-input::placeholder, .field-textarea::placeholder {
    color: var(--color-text-muted);
  }

  .remove-input {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    margin-top: var(--space-md);
  }

  .remove-input:hover {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: var(--color-text-inverse);
  }

  .remove-input svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .add-input-btn {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--animation-fast);
    justify-content: center;
  }

  .add-input-btn:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .add-input-btn svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .form-actions {
    display: flex;
    gap: var(--space-md);
    justify-content: flex-end;
    margin-top: var(--space-sm);
  }

  /* Buttons */
  .btn {
    padding: var(--space-md) var(--space-xl);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm);
    font-weight: 600;
    transition: all var(--animation-fast);
    border: 1px solid;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
  }

  .btn-primary {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .btn-primary:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text-secondary);
  }

  .btn-secondary:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .recipe-timing {
      flex-wrap: wrap;
    }

    .recipe-meta {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .progress-ring {
      width: 60px;
      height: 60px;
    }

    .progress-text {
      font-size: var(--font-size-xs);
    }

    .recipe-section {
      padding: var(--space-lg);
    }

    .ingredient-input-row, .instruction-input-row {
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
    }

    .remove-input {
      grid-column: 1 / -1;
      justify-self: end;
      margin-top: var(--space-sm);
    }

    .modal-overlay {
      padding: 0;
      align-items: flex-end;
    }

    .modal-content {
      max-width: none;
      border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    }
  }

  /* Safe area support */
  @supports (padding: max(0px)) {
    .container {
      padding-left: max(var(--space-lg), env(safe-area-inset-left));
      padding-right: max(var(--space-lg), env(safe-area-inset-right));
      padding-bottom: max(var(--space-5xl), env(safe-area-inset-bottom));
    }
  }
</style>
