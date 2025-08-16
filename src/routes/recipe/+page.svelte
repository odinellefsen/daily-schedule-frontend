<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import type { RecipeTimingType } from '$lib/types/recipe';

  export let data: {
    isAuthed: boolean;
    recipes: Array<{
      id: string;
      nameOfTheRecipe: string;
      generalDescriptionOfTheRecipe?: string;
      whenIsItConsumed?: RecipeTimingType[];
      ingredientCount?: number;
      stepCount?: number;
      isComplete?: boolean;
      createdAt?: string;
      updatedAt?: string;
    }>;
    error: string | null;
    searchQuery?: string | null;
    timing?: string | null;
  };

  let showCreate = false;
  let showSearch = false;
  let searchQuery = data.searchQuery || '';
  let selectedTiming = data.timing || '';

  const timingOptions: { value: RecipeTimingType; label: string; icon: string; color: string }[] = [
    { value: 'BREAKFAST', label: 'Breakfast', icon: '☀️', color: 'var(--color-warning)' },
    { value: 'LUNCH', label: 'Lunch', icon: '🌞', color: 'var(--color-accent)' },
    { value: 'DINNER', label: 'Dinner', icon: '🌙', color: 'var(--color-secondary)' },
    { value: 'SNACK', label: 'Snack', icon: '🍎', color: 'var(--color-danger)' }
  ];

  function getTimingInfo(timing: RecipeTimingType) {
    return timingOptions.find(t => t.value === timing) || { label: timing, icon: '🍽️', color: 'var(--color-text-muted)' };
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedTiming) params.append('timing', selectedTiming);
    
    const queryString = params.toString();
    goto(`/recipe${queryString ? `?${queryString}` : ''}`, { invalidateAll: true });
    showSearch = false;
  }

  function clearSearch() {
    searchQuery = '';
    selectedTiming = '';
    goto('/recipe', { invalidateAll: true });
    showSearch = false;
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="container">
  <header class="page-header">
    <div class="header-content">
      <div class="header-main">
        <button class="back-btn" on:click={() => history.back()} aria-label="Go back">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="page-title">Recipes</h1>
      </div>
      <div class="header-actions">
        <button class="search-btn" on:click={() => (showSearch = true)} aria-label="Search recipes">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </button>
        {#if data.isAuthed}
          <button class="add-btn" on:click={() => (showCreate = true)} aria-label="Create recipe">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        {/if}
      </div>
    </div>

    <!-- Search/Filter Summary -->
    {#if data.searchQuery || data.timing}
      <div class="search-summary">
        <div class="search-info">
          {#if data.searchQuery}
            <span class="search-term">"{data.searchQuery}"</span>
          {/if}
          {#if data.timing}
            <span class="timing-filter" style="background-color: {getTimingInfo(data.timing as RecipeTimingType).color}">
              {getTimingInfo(data.timing as RecipeTimingType).icon} {getTimingInfo(data.timing as RecipeTimingType).label}
            </span>
          {/if}
        </div>
        <button class="clear-search" on:click={clearSearch} aria-label="Clear search">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    {/if}
  </header>

  {#if data.error}
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-text">{data.error}</p>
      <button class="error-retry" on:click={() => invalidateAll()}>Try again</button>
    </div>
  {:else if !data.isAuthed}
    <div class="welcome-state">
      <div class="welcome-icon">👨‍🍳</div>
      <h2 class="welcome-title">Ready to cook?</h2>
      <p class="welcome-text">Sign in to create and manage your recipe collection.</p>
      <a href="/sign-in" class="welcome-cta">
        <span>Sign in to continue</span>
        <svg class="welcome-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
        </svg>
      </a>
    </div>
  {:else if data.recipes.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📝</div>
      <h2 class="empty-title">
        {data.searchQuery || data.timing ? 'No recipes found' : 'No recipes yet'}
      </h2>
      <p class="empty-text">
        {data.searchQuery || data.timing 
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Start building your recipe collection by creating your first recipe.'
        }
      </p>
      {#if data.searchQuery || data.timing}
        <button class="empty-cta secondary" on:click={clearSearch}>
          <span>Clear search</span>
        </button>
      {:else if data.isAuthed}
        <button class="empty-cta" on:click={() => (showCreate = true)}>
          <span>Create your first recipe</span>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      {/if}
    </div>
  {:else}
    <div class="recipes-grid">
      {#each data.recipes as recipe}
        <a class="recipe-card" href={`/recipe/${recipe.id}`} aria-label={recipe.nameOfTheRecipe}>
          <div class="recipe-header">
            <div class="recipe-status" class:complete={recipe.isComplete}>
              {recipe.isComplete ? '✅' : '⏳'}
            </div>
            <div class="recipe-title">{recipe.nameOfTheRecipe}</div>
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
          
          <div class="recipe-stats">
            <div class="stat">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <span>{recipe.ingredientCount || 0} ingredients</span>
            </div>
            <div class="stat">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
              <span>{recipe.stepCount || 0} steps</span>
            </div>
          </div>
          
          {#if recipe.createdAt}
            <div class="recipe-date">Created {formatDate(recipe.createdAt)}</div>
          {/if}
        </a>
      {/each}
    </div>
  {/if}

  <!-- Search Modal -->
  {#if showSearch}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Search recipes" on:click={() => (showSearch = false)}>
      <div class="modal-content" role="document" on:click|stopPropagation>
        <div class="modal-header">
          <h2 class="modal-title">Search Recipes</h2>
          <button type="button" class="modal-close" on:click={() => (showSearch = false)} aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="search-form">
          <div class="form-field">
            <label for="search-input" class="field-label">Search by name or description</label>
            <input 
              id="search-input"
              bind:value={searchQuery}
              class="field-input"
              placeholder="e.g., chicken, pasta, salad..."
              on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">Filter by meal timing</label>
            <div class="timing-options">
              <label class="timing-option">
                <input type="radio" bind:group={selectedTiming} value="" />
                <span class="timing-radio">All meals</span>
              </label>
              {#each timingOptions as timing}
                <label class="timing-option">
                  <input type="radio" bind:group={selectedTiming} value={timing.value} />
                  <span class="timing-radio" style="--timing-color: {timing.color}">
                    {timing.icon} {timing.label}
                  </span>
                </label>
              {/each}
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => (showSearch = false)}>Cancel</button>
            <button type="button" class="btn btn-primary" on:click={handleSearch}>Search</button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Create Recipe Modal -->
  {#if showCreate}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Create recipe" on:click={() => (showCreate = false)}>
      <div class="modal-content" role="document" on:click|stopPropagation>
        <form method="POST" action="?/create" class="modal-form" use:enhance={() => async ({ result }) => {
          if (result.type === 'redirect') {
            await invalidateAll();
            showCreate = false;
            await goto(result.location, { invalidateAll: true });
          }
          if (result.type === 'success') {
            await invalidateAll();
            showCreate = false;
          }
        }}>
          <div class="modal-header">
            <h2 class="modal-title">Create Recipe</h2>
            <button type="button" class="modal-close" on:click={() => (showCreate = false)} aria-label="Close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="form-field">
            <label for="recipe-name" class="field-label">Recipe name</label>
            <input 
              id="recipe-name"
              name="nameOfTheRecipe" 
              class="field-input"
              placeholder="e.g., Chicken Teriyaki Bowl"
              required 
            />
          </div>
          
          <div class="form-field">
            <label for="recipe-description" class="field-label">Description (optional)</label>
            <textarea 
              id="recipe-description"
              name="generalDescriptionOfTheRecipe" 
              class="field-textarea"
              placeholder="Brief description of the recipe..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-field">
            <label class="field-label">When is it consumed?</label>
            <div class="timing-checkboxes">
              {#each timingOptions as timing}
                <label class="timing-checkbox">
                  <input type="checkbox" name="whenIsItConsumed" value={timing.value} />
                  <span class="timing-check" style="--timing-color: {timing.color}">
                    {timing.icon} {timing.label}
                  </span>
                </label>
              {/each}
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => (showCreate = false)}>Cancel</button>
            <button type="submit" class="btn btn-primary">Create Recipe</button>
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
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .header-main {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex: 1;
  }

  .header-actions {
    display: flex;
    gap: var(--space-sm);
  }

  .back-btn, .search-btn, .add-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    flex-shrink: 0;
  }

  .back-btn, .search-btn {
    background: var(--color-surface-hover);
    color: var(--color-text-secondary);
  }

  .add-btn {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    box-shadow: var(--shadow-sm);
  }

  .back-btn:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    transform: translateX(-2px);
  }

  .search-btn:hover {
    background: var(--color-secondary);
    border-color: var(--color-secondary);
    color: var(--color-text-inverse);
  }

  .add-btn:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .back-btn svg, .search-btn svg, .add-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .page-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  /* Search Summary */
  .search-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    margin-top: var(--space-lg);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
  }

  .search-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .search-term {
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .timing-filter {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-inverse);
  }

  .clear-search {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
  }

  .clear-search:hover {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: var(--color-text-inverse);
  }

  .clear-search svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  /* States */
  .error-state, .welcome-state, .empty-state {
    text-align: center;
    padding: var(--space-5xl) var(--space-lg);
    margin-top: var(--space-3xl);
  }

  .error-icon, .welcome-icon, .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-xl);
    display: block;
  }

  .error-title, .welcome-title, .empty-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md) 0;
  }

  .error-text, .welcome-text, .empty-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-2xl) 0;
  }

  .error-retry, .welcome-cta, .empty-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-xl);
    background: var(--color-primary);
    color: var(--color-text-inverse);
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--animation-fast);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-primary);
  }

  .empty-cta.secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

  .error-retry:hover, .welcome-cta:hover, .empty-cta:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  .empty-cta.secondary:hover {
    background: var(--color-surface-hover);
  }

  .welcome-arrow, .empty-cta svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Recipes Grid */
  .recipes-grid {
    display: grid;
    gap: var(--space-lg);
    margin-top: var(--space-lg);
  }

  .recipe-card {
    display: block;
    padding: var(--space-xl);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--animation-fast);
    position: relative;
    overflow: hidden;
  }

  .recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-border);
  }

  .recipe-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .recipe-status {
    font-size: 1.25rem;
    opacity: 0.7;
  }

  .recipe-status.complete {
    opacity: 1;
  }

  .recipe-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
    flex: 1;
  }

  .recipe-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin: 0 0 var(--space-lg) 0;
  }

  .recipe-timing {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-bottom: var(--space-lg);
  }

  .timing-badge {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-inverse);
  }

  .recipe-stats {
    display: flex;
    gap: var(--space-lg);
    margin-bottom: var(--space-md);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .stat-icon {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .recipe-date {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
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
    max-width: 500px;
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

  .search-form, .modal-form {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    overflow-y: auto;
  }

  /* Form Elements */
  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .field-label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-primary);
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

  /* Timing Options */
  .timing-options, .timing-checkboxes {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .timing-option, .timing-checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
  }

  .timing-option input[type="radio"], .timing-checkbox input[type="checkbox"] {
    margin: 0;
  }

  .timing-radio, .timing-check {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    transition: all var(--animation-fast);
    flex: 1;
  }

  .timing-option input[type="radio"]:checked + .timing-radio,
  .timing-checkbox input[type="checkbox"]:checked + .timing-check {
    background: var(--timing-color, var(--color-primary));
    border-color: var(--timing-color, var(--color-primary));
    color: var(--color-text-inverse);
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
    .recipes-grid {
      gap: var(--space-md);
    }

    .recipe-card {
      padding: var(--space-lg);
    }

    .recipe-stats {
      flex-direction: column;
      gap: var(--space-sm);
    }

    .modal-overlay {
      padding: 0;
      align-items: flex-end;
    }

    .modal-content {
      max-width: none;
      border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    }

    .header-actions {
      gap: var(--space-xs);
    }

    .timing-options, .timing-checkboxes {
      gap: var(--space-xs);
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
