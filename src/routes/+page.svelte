<script lang="ts">
  import { enhance } from '$app/forms';
  
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
    ({ overdue: '#ef4444', now: '#10b981', upcoming: '#f59e0b', later: '#9ca3af' }[u]);

  let show = false;
  let nowLocal = '';

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
</script>

<main class="wrap">
  <header class="topbar">
    <h1>Today</h1>
    <div class="counts">{data.counts.remaining} left</div>
  </header>

  {#if data.isAuthed}
    <button class="fab" on:click={() => (show = true)} aria-label="Add todo">+</button>
    {#if show}
      <div class="overlay" role="dialog" aria-modal="true" aria-label="Add todo">
        <form method="POST" class="dialog" use:enhance={({ formElement }) => {
          console.log('Form submitting...');
          const formData = new FormData(formElement);
          console.log('Client form data:', Array.from(formData.entries()));
          return async ({ result }) => {
            console.log('Form result:', result);
            if (result.type === 'redirect') {
              show = false;
            } else if (result.type === 'failure') {
              console.error('Form failed:', result.data);
            }
          };
        }}>
          <h2>Add todo</h2>
          <input name="description" placeholder="What to do?" aria-label="Description" required />
          <input name="scheduledFor" type="datetime-local" aria-label="When" value={nowLocal} />
          <div class="row">
            <button type="button" class="btn ghost" on:click={() => (show = false)}>Cancel</button>
            <button class="btn primary" type="submit">Add</button>
          </div>
        </form>
      </div>
    {/if}
  {/if}

  {#if data.isAuthed === false}
    <p class="empty">Sign in to see your tasks.</p>
  {:else if data.todos.length === 0}
    <p class="empty">You're all set for today.</p>
  {:else}
    <ul class="list">
      {#each data.todos as t}
        <li class="item" data-disabled={!t.canStartNow} style={`--accent:${urgencyColor(t.urgency)}`}>
          <div class="bullet" aria-hidden="true"></div>
          <div class="content">
            <div class="title">{t.description}</div>
            <div class="meta">
              {#if t.context.type === 'meal' && t.context.mealName}
                <span class="badge">Step {t.context.stepNumber} • {t.context.mealName}</span>
              {/if}
              <time>{new Date(t.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
          </div>
          <button class="cta" disabled={!t.canStartNow} aria-label="Complete">
            ✓
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  :root { color-scheme: light dark; }
  .wrap {
    max-width: 28rem;
    margin: 0 auto;
    padding: 12px 12px 24px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: var(--bg, #fff);
    overflow-x: hidden;
  }
  .topbar { display: flex; align-items: baseline; justify-content: space-between; }
  h1 { font-size: 1.25rem; margin: 0; }
  .counts { font-size: 0.875rem; color: #6b7280; }
  .fab { position: fixed; right: 16px; bottom: 16px; width: 56px; height: 56px; border-radius: 999px; border: 0; background: #111827; color: #fff; font-size: 1.5rem; box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: flex-end; justify-content: center; padding: 0; overflow: hidden; }
  .dialog { width: 100%; max-width: 100%; margin: 0; background: #fff; color: #111827; padding: 16px; border-radius: 16px 16px 0 0; display: grid; gap: 10px; box-sizing: border-box; overflow-x: hidden; }
  .dialog h2 { margin: 0 0 4px 0; font-size: 1.1rem; }
  .dialog input { font-size: 1rem; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box; }
  .row { display: flex; justify-content: flex-end; gap: 8px; }
  .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
  .btn.primary { background: #111827; border-color: #111827; color: #fff; }
  .btn.ghost { background: #fff; }
  .empty { margin-top: 24px; color: #6b7280; font-size: 0.95rem; }

  .list { list-style: none; padding: 0; margin: 12px 0 0; display: grid; gap: 10px; }
  .item {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: #f8fafc;
    box-shadow: 0 1px 0 rgba(0,0,0,0.04) inset;
    opacity: 1;
  }
  .item[data-disabled="true"] { opacity: 0.6; }
  .bullet {
    width: 10px;
    height: 10px;
    border-radius: 9999px;
    background: var(--accent, #9ca3af);
  }
  .content { display: grid; gap: 6px; }
  .title { font-size: 0.98rem; line-height: 1.2; }
  .meta { display: flex; gap: 8px; align-items: center; color: #6b7280; font-size: 0.78rem; }
  .badge { padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,0.06); }
  time { margin-left: auto; }
  .cta { border: 0; background: var(--accent, #10b981); color: #fff; width: 36px; height: 36px; border-radius: 10px; font-size: 1rem; }
  .cta:disabled { filter: grayscale(1); opacity: 0.6; }

  @media (min-width: 480px) {
    .wrap { padding: 16px 16px 28px; }
    h1 { font-size: 1.4rem; }
  }
</style>
