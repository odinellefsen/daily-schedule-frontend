<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';

  export let data: {
    isAuthed: boolean;
    items: Array<{ id: string; foodItemName: string; categoryHierarchy?: string[] | null; unitCount?: number; hasUnits?: boolean }>;
    topCategories: string[];
    baseItems: Array<{ id: string; foodItemName: string; categoryHierarchy?: string[] | null; unitCount?: number; hasUnits?: boolean }>;
  };

  let showCreate = false;
  let categoryPath = '';
</script>

<main class="wrap">
  <header class="top">
    <h1>Food Items</h1>
    {#if data.isAuthed}
      <button class="fab" on:click={() => (showCreate = true)} aria-label="Create food item">+</button>
    {/if}
  </header>

  {#if data.topCategories.length === 0 && data.baseItems.length === 0}
    <p class="empty">No items yet.</p>
  {/if}

  {#if data.topCategories.length}
  <section class="section">
    <h2>Categories</h2>
    <ul class="chips">
      {#each data.topCategories as c}
        <li><span class="chip">{c}</span></li>
      {/each}
    </ul>
  </section>
  {/if}

  {#if data.baseItems.length}
  <section class="section">
    <h2>Items</h2>
    <ul class="list">
      {#each data.baseItems as it}
        <li>
          <a class="row" href={`/food-item/${it.id}`} aria-label={it.foodItemName}>
            <span class="title">{it.foodItemName}</span>
            <small class="meta">{it.hasUnits ? `${it.unitCount ?? 0} units` : 'no units'}</small>
          </a>
        </li>
      {/each}
    </ul>
  </section>
  {/if}

  {#if showCreate}
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Create food item" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showCreate = false)} on:pointerdown={() => (showCreate = false)}>
      <div class="sheet" role="document" on:pointerdown|stopPropagation>
      <form method="POST" on:submit|preventDefault use:enhance={() => async ({ result }) => {
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
        <h2>Create food item</h2>
        <input name="foodItemName" placeholder="Name" aria-label="Food item name" required />
        <input name="categoryPath" placeholder="Category path (e.g. protein > poultry)" bind:value={categoryPath} aria-label="Category path" />
        <div class="row-2">
          <button type="button" class="btn ghost" on:click={() => (showCreate = false)}>Cancel</button>
          <button class="btn primary" type="submit">Create</button>
        </div>
      </form>
      </div>
    </div>
  {/if}
</main>

<style>
  :root { color-scheme: light dark; }
  .wrap { max-width: 28rem; margin: 0 auto; padding: 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
  .top { display: flex; align-items: center; justify-content: space-between; position: relative; }
  h1 { margin: 0; font-size: 1.25rem; }
  .fab { border: 0; width: 40px; height: 40px; border-radius: 999px; background: #111827; color: #fff; font-size: 1.1rem; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }

  .section { margin-top: 12px; }
  h2 { margin: 0 0 8px 0; font-size: 1rem; color: #111827; }
  .chips { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { display: inline-block; padding: 8px 10px; border-radius: 999px; background: #f3f4f6; color: #111827; font-weight: 600; border: 1px solid #e5e7eb; }

  .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .row { display: flex; align-items: baseline; justify-content: space-between; text-decoration: none; padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; color: #111827; background: #ffffff; }
  .title { font-weight: 700; }
  .meta { color: #6b7280; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: flex-end; justify-content: center; padding: 0; }
  .sheet { width: 100%; max-width: 100%; margin: 0; background: #fff; color: #111827; padding: 16px; border-radius: 16px 16px 0 0; box-sizing: border-box; display: grid; gap: 10px; }
  .sheet h2 { margin: 0 0 4px 0; font-size: 1.1rem; }
  .sheet input { font-size: 1rem; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box; }
  .row-2 { display: flex; justify-content: flex-end; gap: 8px; }
  .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
  .btn.primary { background: #111827; border-color: #111827; color: #fff; }
  .btn.ghost { background: #fff; }
</style>


