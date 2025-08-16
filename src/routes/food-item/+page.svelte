<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';

  export let data: {
    isAuthed: boolean;
    currentPath?: string[];
    nextCategories?: string[];
    levelItems?: Array<{ id: string; foodItemName: string; categoryHierarchy?: string[] | null; unitCount?: number; hasUnits?: boolean }>;
    topCategories?: string[];
  };

  let showCreate = false;
  let categoryPath = '';
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
        <h1 class="page-title">Food Items</h1>
      </div>
      {#if data.isAuthed}
        <button class="add-btn" on:click={() => (showCreate = true)} aria-label="Create food item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      {/if}
    </div>
  </header>

  {#if (!data.topCategories || data.topCategories.length === 0) && (!data.levelItems || data.levelItems.length === 0)}
    <div class="empty-state">
      <div class="empty-icon">🥗</div>
      <h2 class="empty-title">No food items yet</h2>
      <p class="empty-text">Start building your personal food library by adding your first item.</p>
      {#if data.isAuthed}
        <button class="empty-cta" on:click={() => (showCreate = true)}>
          <span>Add your first item</span>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      {/if}
    </div>
  {/if}

  {#if (data.currentPath?.length ?? 0) > 0}
    <section class="section">
      <h2 class="section-title">Navigation</h2>
      <nav class="breadcrumbs">
        <a class="breadcrumb-item" href="/food-item">
          <svg class="breadcrumb-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          root
        </a>
        {#each (data.currentPath ?? []) as seg, i}
          <svg class="breadcrumb-separator" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <a class="breadcrumb-item" href={`/food-item?path=${encodeURIComponent((data.currentPath ?? []).slice(0,i+1).join(' > '))}`}>
            {seg}
          </a>
        {/each}
      </nav>
    </section>
  {/if}

  {#if (data.currentPath?.length ?? 0) === 0 && data.topCategories?.length}
    <section class="section">
      <h2 class="section-title">Categories</h2>
      <div class="categories-grid">
        {#each data.topCategories as category}
          <a class="category-chip" href={`/food-item?path=${encodeURIComponent(category)}`}>
            <div class="chip-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <span class="chip-text">{category}</span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  {#if data.levelItems && data.levelItems.length}
    <section class="section">
      <h2 class="section-title">Items</h2>
      <div class="items-list">
        {#each data.levelItems as item}
          <a class="item-card" href={`/food-item/${item.id}?name=${encodeURIComponent(item.foodItemName)}`} aria-label={item.foodItemName}>
            <div class="item-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
            </div>
            <div class="item-content">
              <h3 class="item-title">{item.foodItemName}</h3>
              <p class="item-meta">{item.hasUnits ? `${item.unitCount ?? 0} ${item.unitCount === 1 ? 'unit' : 'units'}` : 'No units yet'}</p>
            </div>
            <div class="item-arrow">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Create Food Item Modal -->
  {#if showCreate}
    <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Create food item" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showCreate = false)} on:pointerdown={() => (showCreate = false)}>
      <div class="modal-content" role="document" on:pointerdown|stopPropagation>
        <form method="POST" class="modal-form" on:submit|preventDefault use:enhance={() => async ({ result }) => {
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
            <h2 class="modal-title">Create food item</h2>
            <button type="button" class="modal-close" on:click={() => (showCreate = false)} aria-label="Close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="form-field">
            <label for="food-name" class="field-label">Food item name</label>
            <input 
              id="food-name"
              name="foodItemName" 
              class="field-input"
              placeholder="e.g., Chicken breast, Brown rice..." 
              aria-label="Food item name" 
              required 
            />
          </div>
          
          <div class="form-field">
            <label for="category-path" class="field-label">Category (optional)</label>
            <input 
              id="category-path"
              name="categoryPath" 
              class="field-input"
              placeholder="e.g., protein > poultry"
              bind:value={categoryPath} 
              aria-label="Category path" 
            />
            <p class="field-hint">Use " > " to separate category levels</p>
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" on:click={() => (showCreate = false)}>Cancel</button>
            <button type="submit" class="btn btn-primary">Create Item</button>
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

  .page-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  .add-btn {
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
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }

  .add-btn:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .add-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--space-5xl) var(--space-lg);
    margin-top: var(--space-3xl);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-xl);
    display: block;
  }

  .empty-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md) 0;
  }

  .empty-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-2xl) 0;
  }

  .empty-cta {
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

  .empty-cta:hover {
    background: var(--color-primary-light);
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  .empty-cta svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Sections */
  .section {
    margin-top: var(--space-3xl);
  }

  .section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-lg) 0;
  }

  /* Breadcrumbs */
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    flex-wrap: wrap;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--animation-fast);
  }

  .breadcrumb-item:hover {
    color: var(--color-text-primary);
    background: var(--color-surface-hover);
  }

  .breadcrumb-icon {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .breadcrumb-separator {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-muted);
    stroke-width: 2;
  }

  /* Categories Grid */
  .categories-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
  }

  .category-chip {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    color: var(--color-text-primary);
    font-weight: 500;
    transition: all var(--animation-fast);
  }

  .category-chip:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .chip-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chip-icon svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  /* Items List */
  .items-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .item-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--animation-fast);
  }

  .item-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-border);
  }

  .item-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .item-icon svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .item-content {
    min-width: 0;
    flex: 1;
  }

  .item-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-xs) 0;
    line-height: 1.3;
  }

  .item-meta {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .item-arrow {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-light);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    flex-shrink: 0;
  }

  .item-card:hover .item-arrow {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    transform: translateX(2px);
  }

  .item-arrow svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
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
    max-width: 400px;
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

  .field-input {
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-base);
    transition: all var(--animation-fast);
    background: var(--color-surface);
    color: var(--color-text-primary);
  }

  .field-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.1);
  }

  .field-input::placeholder {
    color: var(--color-text-muted);
  }

  .field-hint {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin: 0;
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
  @media (max-width: 480px) {
    .header-main {
      gap: var(--space-sm);
    }

    .page-title {
      font-size: var(--font-size-2xl);
    }

    .categories-grid {
      gap: var(--space-sm);
    }

    .category-chip {
      padding: var(--space-sm) var(--space-md);
      font-size: var(--font-size-sm);
    }

    .item-card {
      padding: var(--space-md);
      gap: var(--space-md);
    }

    .item-icon, .item-arrow {
      width: 40px;
      height: 40px;
    }

    .item-icon svg, .item-arrow svg {
      width: 1.125rem;
      height: 1.125rem;
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


