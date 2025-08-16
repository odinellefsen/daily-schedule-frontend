<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';
  
  export let data: {
    todos: Array<{
      id: string;
      description: string;
      scheduledFor: string;
      completed: boolean;
      context: { type: 'meal' | 'standalone'; mealName?: string; stepNumber?: number; estimatedDuration?: number };
      urgency: 'overdue' | 'now' | 'upcoming' | 'later';
      canStartNow: boolean;
      isOverdue: boolean;
    }>;
    counts: { total: number; completed: number; remaining: number; overdue: number };
    isAuthed?: boolean;
  };

  const urgencyColor = (u: 'overdue' | 'now' | 'upcoming' | 'later') =>
    ({ overdue: 'var(--color-danger)', now: 'var(--color-accent)', upcoming: 'var(--color-warning)', later: 'var(--color-text-muted)' }[u]);

  let show = false;
  let nowLocal = '';
  let showFood = false;

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  function nowLocalDatetime() {
    const d = new Date();
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  }
  $: if (show) nowLocal = nowLocalDatetime();

  const urgencyLabel = (u: 'overdue' | 'now' | 'upcoming' | 'later') =>
    ({ overdue: 'Overdue', now: 'Now', upcoming: 'Soon', later: 'Later' }[u]);
</script>

<div class="container">
  <header class="page-header">
    <div class="header-content">
      <h1 class="page-title">Today</h1>
      <div class="stats">
        {#if data.counts.overdue > 0}
          <div class="stat-item overdue">
            <span class="stat-number">{data.counts.overdue}</span>
            <span class="stat-label">overdue</span>
          </div>
        {/if}
        <div class="stat-item">
          <span class="stat-number">{data.counts.remaining}</span>
          <span class="stat-label">{data.counts.remaining === 1 ? 'left' : 'left'}</span>
        </div>
      </div>
    </div>
  </header>

  {#if data.isAuthed === false}
    <div class="welcome-state">
      <div class="welcome-icon">✨</div>
      <h2 class="welcome-title">Ready to get organized?</h2>
      <p class="welcome-text">Sign in to see your daily tasks and reduce decision fatigue.</p>
      <a href="/sign-in" class="welcome-cta">
        <span>Sign in to continue</span>
        <svg class="welcome-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
        </svg>
      </a>
    </div>
  {:else if data.todos.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🎉</div>
      <h2 class="empty-title">All done for today!</h2>
      <p class="empty-text">You've completed all your tasks. Great work!</p>
    </div>
  {:else}
    <div class="todos-container">
      <ul class="todo-list">
        {#each data.todos as t}
          <li class="todo-item" data-disabled={!t.canStartNow} style={`--accent-color:${urgencyColor(t.urgency)}`}>
            <div class="todo-indicator" aria-hidden="true"></div>
            <div class="todo-content">
              <div class="todo-title">{t.description}</div>
              <div class="todo-meta">
                {#if t.context.type === 'meal' && t.context.mealName}
                  <span class="context-badge meal-badge">
                    <svg class="badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Step {t.context.stepNumber} • {t.context.mealName}
                  </span>
                {/if}
                <div class="time-info">
                  <span class="urgency-badge" style={`background-color: ${urgencyColor(t.urgency)}`}>
                    {urgencyLabel(t.urgency)}
                  </span>
                  <time class="todo-time">{new Date(t.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              </div>
            </div>
            <div class="todo-actions">
              <form method="POST" class="inline-form">
                <input type="hidden" name="intent" value="cancel" />
                <input type="hidden" name="id" value={t.id} />
                <button class="action-btn cancel-btn" type="submit" aria-label="Cancel task">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </form>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- Floating Action Buttons -->
  {#if data.isAuthed}
    <button class="fab primary-fab" on:click={() => (show = true)} aria-label="Add todo">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
    </button>
    
    <button class="fab secondary-fab" on:click={() => (showFood = true)} aria-label="Open food menu">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"></path>
      </svg>
    </button>

    <!-- Add Todo Modal -->
    {#if show}
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Add todo">
        <div class="modal-content" role="document" on:click|stopPropagation>
          <form method="POST" class="modal-form" use:enhance={({ formElement }) => {
            const formData = new FormData(formElement);
            return async ({ result }) => {
              if (result.type === 'redirect') {
                await invalidateAll();
                show = false;
                await goto(result.location, { invalidateAll: true });
                return;
              }
              if (result.type === 'success') {
                await invalidateAll();
                show = false;
                return;
              }
              if (result.type === 'failure') {
                console.error('Form failed:', result.data);
              }
            };
          }}>
            <div class="modal-header">
              <h2 class="modal-title">Add new task</h2>
              <button type="button" class="modal-close" on:click={() => (show = false)} aria-label="Close">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="form-field">
              <label for="task-description" class="field-label">What needs to be done?</label>
              <input 
                id="task-description"
                name="description" 
                class="field-input" 
                placeholder="Enter task description..." 
                aria-label="Task description" 
                required 
              />
            </div>
            
            <div class="form-field">
              <label for="task-schedule" class="field-label">When?</label>
              <input 
                id="task-schedule"
                name="scheduledFor" 
                type="datetime-local" 
                class="field-input"
                aria-label="Schedule for" 
                value={nowLocal} 
              />
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" on:click={() => (show = false)}>Cancel</button>
              <button type="submit" class="btn btn-primary">Add Task</button>
            </div>
          </form>
        </div>
      </div>
    {/if}

    <!-- Food Menu Modal -->
    {#if showFood}
      <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Food menu" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showFood = false)} on:click={() => (showFood = false)}>
        <div class="bottom-sheet" role="document" on:click|stopPropagation>
          <div class="sheet-header">
            <div class="sheet-handle"></div>
            <h2 class="sheet-title">Quick Actions</h2>
          </div>
          
          <div class="sheet-content">
            <a class="sheet-action" href="/food" aria-label="Food management">
              <div class="action-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
              </div>
              <div class="action-content">
                <div class="action-title">Food</div>
                <div class="action-subtitle">Manage food items and meals</div>
              </div>
              <svg class="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
          
          <div class="sheet-footer">
            <button class="btn btn-secondary btn-block" type="button" on:click={() => (showFood = false)}>Close</button>
          </div>
        </div>
      </div>
    {/if}
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
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-lg);
  }

  .page-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  .stats {
    display: flex;
    gap: var(--space-lg);
    align-items: flex-end;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .stat-item.overdue .stat-number {
    color: var(--color-danger);
  }

  .stat-number {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    line-height: 1;
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
    margin-top: var(--space-xs);
  }

  /* Empty States */
  .welcome-state, .empty-state {
    text-align: center;
    padding: var(--space-5xl) var(--space-lg);
    margin-top: var(--space-3xl);
  }

  .welcome-icon, .empty-icon {
    font-size: 3rem;
    margin-bottom: var(--space-xl);
    display: block;
  }

  .welcome-title, .empty-title {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-md) 0;
  }

  .welcome-text, .empty-text {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-2xl) 0;
  }

  .welcome-cta {
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
  }

  .welcome-cta:hover {
    background: var(--color-primary-light);
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  .welcome-arrow {
    width: 1.25rem;
    height: 1.25rem;
  }

  /* Todo List */
  .todos-container {
    margin-top: var(--space-lg);
  }

  .todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .todo-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--animation-fast);
    position: relative;
    overflow: hidden;
  }

  .todo-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--accent-color);
    opacity: 0.8;
  }

  .todo-item:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-border);
  }

  .todo-item[data-disabled="true"] {
    opacity: 0.6;
    filter: grayscale(0.2);
  }

  .todo-indicator {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full);
    background: var(--accent-color);
    margin-top: var(--space-xs);
    flex-shrink: 0;
  }

  .todo-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 0;
  }

  .todo-title {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.4;
  }

  .todo-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .context-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: 500;
    width: fit-content;
  }

  .badge-icon {
    width: 0.875rem;
    height: 0.875rem;
    stroke-width: 2;
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .urgency-badge {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-inverse);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .todo-time {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .todo-actions {
    display: flex;
    gap: var(--space-xs);
    margin-top: var(--space-xs);
  }

  .inline-form {
    display: contents;
  }

  .action-btn {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-fast);
    flex-shrink: 0;
  }

  .cancel-btn {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
  }

  .cancel-btn:hover {
    background: var(--color-danger);
    border-color: var(--color-danger);
    color: var(--color-text-inverse);
    transform: scale(1.05);
  }

  .action-btn svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Floating Action Buttons */
  .fab {
    position: fixed;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-lg);
    transition: all var(--animation-normal);
    z-index: 30;
  }

  .fab:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }

  .fab:active {
    transform: translateY(0);
  }

  .primary-fab {
    right: var(--space-lg);
    bottom: var(--space-lg);
    background: var(--color-primary);
    color: var(--color-text-inverse);
  }

  .secondary-fab {
    left: var(--space-lg);
    bottom: var(--space-lg);
    background: var(--color-secondary);
    color: var(--color-text-inverse);
  }

  .fab svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
  }

  /* Modal Overlay */
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

  /* Modal Content */
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

  .btn-block {
    width: 100%;
  }

  /* Bottom Sheet */
  .bottom-sheet {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
    max-height: 80vh;
    animation: sheetSlideUp var(--animation-normal);
    box-shadow: var(--shadow-xl);
  }

  @keyframes sheetSlideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .sheet-header {
    padding: var(--space-lg) var(--space-lg) var(--space-md);
    border-bottom: 1px solid var(--color-border-light);
    text-align: center;
    position: relative;
  }

  .sheet-handle {
    width: 36px;
    height: 4px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    margin: 0 auto var(--space-md);
  }

  .sheet-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
  }

  .sheet-content {
    padding: var(--space-md) var(--space-lg);
  }

  .sheet-action {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
    transition: all var(--animation-fast);
    background: var(--color-surface);
    border: 1px solid var(--color-border-light);
  }

  .sheet-action:hover {
    background: var(--color-surface-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .action-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: var(--color-secondary);
    color: var(--color-text-inverse);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .action-icon svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  .action-content {
    flex: 1;
    min-width: 0;
  }

  .action-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }

  .action-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .action-arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted);
    stroke-width: 2;
    flex-shrink: 0;
  }

  .sheet-footer {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
    border-top: 1px solid var(--color-border-light);
  }

  /* Mobile Specific */
  @media (max-width: 480px) {
    .stats {
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-xs);
    }

    .fab {
      width: 52px;
      height: 52px;
    }

    .fab svg {
      width: 1.375rem;
      height: 1.375rem;
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

  /* Safe area support for iPhone */
  @supports (padding: max(0px)) {
    .container {
      padding-left: max(var(--space-lg), env(safe-area-inset-left));
      padding-right: max(var(--space-lg), env(safe-area-inset-right));
      padding-bottom: max(var(--space-5xl), env(safe-area-inset-bottom));
    }

    .fab {
      bottom: max(var(--space-lg), env(safe-area-inset-bottom));
    }

    .primary-fab {
      right: max(var(--space-lg), env(safe-area-inset-right));
    }

    .secondary-fab {
      left: max(var(--space-lg), env(safe-area-inset-left));
    }
  }
</style>
