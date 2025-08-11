<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto, invalidateAll } from '$app/navigation';

  export let data: {
    isAuthed: boolean;
    title?: string | null;
    item: { id: string; foodItemName: string; categoryHierarchy?: string[] | null } | null;
    units: Array<{
      id: string;
      unitOfMeasurement: string;
      unitDescription?: string;
      calories?: number;
      proteinInGrams?: number;
      carbohydratesInGrams?: number;
      fatInGrams?: number;
    }>;
  };

  let showUnit = false;
</script>

<main class="wrap">
  <header class="top">
    <a class="back" href="/food-item" aria-label="Back">←</a>
    <h1>{data.item?.foodItemName ?? data.title ?? 'Food Item'}</h1>
    {#if data.isAuthed}
      <button class="fab" on:click={() => (showUnit = true)} aria-label="Add unit">＋</button>
    {/if}
  </header>

  {#if data.item?.categoryHierarchy?.length}
    <p class="crumbs">{data.item.categoryHierarchy.join(' › ')}</p>
  {/if}

  <section class="section">
    <h2>Units</h2>
    {#if data.units.length === 0}
      <p class="empty">No units yet.</p>
    {:else}
      <ul class="list">
        {#each data.units as u}
          <li class="unit">
            <div class="unit-title">
              <span class="badge">{u.unitOfMeasurement}</span>
              {#if u.unitDescription}<span class="desc">{u.unitDescription}</span>{/if}
            </div>
            <div class="macros">
              {#if u.calories !== undefined}<span class="kcal">{u.calories} kcal</span>{/if}
              {#if u.proteinInGrams !== undefined}<span>Protein {u.proteinInGrams}g</span>{/if}
              {#if u.carbohydratesInGrams !== undefined}<span>Carbs {u.carbohydratesInGrams}g</span>{/if}
              {#if u.fatInGrams !== undefined}<span>Fat {u.fatInGrams}g</span>{/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  {#if showUnit}
    <div class="overlay" role="dialog" aria-modal="true" aria-label="Add unit" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showUnit = false)} on:pointerdown={() => (showUnit = false)}>
      <div class="sheet" role="document" on:pointerdown|stopPropagation>
      <form method="POST" action="?/addUnit" on:submit|preventDefault use:enhance={() => async ({ result }) => {
        if (result.type === 'redirect') {
          await invalidateAll();
          showUnit = false;
          await goto(result.location, { invalidateAll: true });
        }
        if (result.type === 'success') {
          await invalidateAll();
          showUnit = false;
        }
      }}>
        <h2>Add unit</h2>
        <select name="unitOfMeasurement" aria-label="Unit of measurement" required>
          <option value="" selected disabled>Select unit</option>
          <optgroup label="Weight">
            <option value="Gram">Gram</option>
            <option value="Kilogram">Kilogram</option>
          </optgroup>
          <optgroup label="Volume">
            <option value="Milliliter">Milliliter</option>
            <option value="Liter">Liter</option>
            <option value="Tablespoon">Tablespoon</option>
            <option value="Teaspoon">Teaspoon</option>
          </optgroup>
          <optgroup label="Count">
            <option value="Piece">Piece</option>
            <option value="Whole">Whole</option>
          </optgroup>
          <optgroup label="Approximate">
            <option value="Pinch">Pinch</option>
            <option value="Handful">Handful</option>
          </optgroup>
          <optgroup label="Contextual">
            <option value="Clove">Clove</option>
            <option value="Slice">Slice</option>
            <option value="Strip">Strip</option>
            <option value="Head">Head</option>
            <option value="Bunch">Bunch</option>
          </optgroup>
          <optgroup label="Flexible">
            <option value="To taste">To taste</option>
            <option value="As needed">As needed</option>
          </optgroup>
          <optgroup label="Beverage based">
            <option value="Shot">Shot</option>
            <option value="Dash">Dash</option>
            <option value="Drop">Drop</option>
            <option value="Splash">Splash</option>
            <option value="Scoop">Scoop</option>
            <option value="Drizzle">Drizzle</option>
          </optgroup>
        </select>
        <input name="unitDescription" placeholder="Description (optional)" aria-label="Description" />
        <div class="grid2">
          <input name="calories" type="number" step="1" inputmode="numeric" placeholder="kcal" aria-label="Calories" />
          <input name="proteinInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Protein g" aria-label="Protein" />
          <input name="carbohydratesInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Carbs g" aria-label="Carbs" />
          <input name="fatInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Fat g" aria-label="Fat" />
        </div>
        <div class="row-2">
          <button type="button" class="btn ghost" on:click={() => (showUnit = false)}>Cancel</button>
          <button class="btn primary" type="submit">Add</button>
        </div>
      </form>
      </div>
    </div>
  {/if}
</main>

<style>
  :root { color-scheme: light dark; }
  .wrap { max-width: 28rem; margin: 0 auto; padding: 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
  .top { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; }
  .back { text-decoration: none; color: #111827; font-size: 1.1rem; }
  h1 { margin: 0; font-size: 1.15rem; }
  .fab { border: 0; width: 40px; height: 40px; border-radius: 999px; background: #111827; color: #fff; font-size: 1.1rem; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
  .crumbs { margin: 8px 0 0 0; color: #6b7280; font-size: 0.9rem; }

  .section { margin-top: 12px; }
  h2 { margin: 0 0 8px 0; font-size: 1rem; color: #111827; }
  .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
  .unit { padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; color: #111827; }
  .unit-title { display: flex; gap: 8px; align-items: baseline; }
  .badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #f3f4f6; border: 1px solid #e5e7eb; font-weight: 700; }
  .desc { color: #6b7280; }
  .macros { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; color: #374151; }
  .kcal { font-weight: 700; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: flex-end; justify-content: center; padding: 0; }
  .sheet { width: 100%; max-width: 100%; margin: 0; background: #fff; color: #111827; padding: 16px; border-radius: 16px 16px 0 0; box-sizing: border-box; display: grid; gap: 10px; }
  .sheet h2 { margin: 0 0 4px 0; font-size: 1.1rem; }
  .sheet input { font-size: 1rem; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box; }
  .sheet select { font-size: 1rem; padding: 12px; border-radius: 10px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box; background: #fff; color: #111827; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .row-2 { display: flex; justify-content: flex-end; gap: 8px; }
  .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
  .btn.primary { background: #111827; border-color: #111827; color: #fff; }
  .btn.ghost { background: #fff; }
</style>


