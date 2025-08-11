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
  let showUnitPicker = false;
  let selectedUnit = '';

  const units = [
    { group: 'Weight', options: ['Gram', 'Kilogram'] },
    { group: 'Volume', options: ['Milliliter', 'Liter', 'Tablespoon', 'Teaspoon'] },
    { group: 'Count', options: ['Piece', 'Whole'] },
    { group: 'Approximate', options: ['Pinch', 'Handful'] },
    { group: 'Contextual', options: ['Clove', 'Slice', 'Strip', 'Head', 'Bunch'] },
    { group: 'Flexible', options: ['To taste', 'As needed'] },
    { group: 'Beverage', options: ['Shot', 'Dash', 'Drop', 'Splash', 'Scoop', 'Drizzle'] }
  ];

  function selectUnit(unit: string) {
    selectedUnit = unit;
    showUnitPicker = false;
  }
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
        
        <div class="unit-field">
          <label class="unit-label" for="unit-selector-btn">Unit of measurement</label>
          <button 
            id="unit-selector-btn"
            type="button" 
            class="unit-selector" 
            on:click={() => showUnitPicker = true}
            aria-label="Select unit of measurement"
            aria-haspopup="dialog"
            aria-expanded={showUnitPicker}
          >
            <span class="unit-text">{selectedUnit || 'Select unit'}</span>
            <svg class="unit-chevron" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.86l3.71-3.63a.75.75 0 111.04 1.08l-4.25 4.17a.75.75 0 01-1.04 0L5.21 8.31a.75.75 0 01.02-1.1z" clip-rule="evenodd" />
            </svg>
          </button>
          <input type="hidden" name="unitOfMeasurement" value={selectedUnit} required />
        </div>
        <input name="unitDescription" placeholder="Description (optional)" aria-label="Description" />

        <div class="grid2">
          <input name="calories" type="number" step="1" inputmode="numeric" placeholder="kcal" aria-label="Calories" />
          <input name="proteinInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Protein g" aria-label="Protein" />
          <input name="carbohydratesInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Carbs g" aria-label="Carbs" />
          <input name="fatInGrams" type="number" step="0.1" inputmode="decimal" placeholder="Fat g" aria-label="Fat" />
        </div>
        <div class="row-2">
          <button type="button" class="btn ghost" on:click={() => (showUnit = false)}>Cancel</button>
          <button class="btn primary" type="submit" disabled={!selectedUnit}>Add</button>
        </div>
      </form>
      </div>
    </div>
  {/if}

  
</main>

{#if showUnitPicker}
  <div class="unit-picker-overlay" role="dialog" aria-modal="true" aria-labelledby="unit-picker-title" tabindex="0" on:click={() => showUnitPicker = false} on:keydown={(e) => e.key === 'Escape' && (showUnitPicker = false)}>
    <div class="unit-picker" role="document" on:pointerdown|stopPropagation>
      <div class="unit-picker-header">
        <button type="button" class="unit-picker-cancel" on:click={() => showUnitPicker = false}>
          Cancel
        </button>
        <h3 id="unit-picker-title" class="unit-picker-title">Select Unit</h3>
        <div class="unit-picker-spacer"></div>
      </div>
      
      <div class="unit-picker-content">
        {#each units as group}
          <div class="unit-group">
            <div class="unit-group-title">{group.group}</div>
            <div class="unit-options">
              {#each group.options as option}
                <button 
                  type="button" 
                  class="unit-option"
                  class:selected={selectedUnit === option}
                  on:click={() => selectUnit(option)}
                >
                  {option}
                  {#if selectedUnit === option}
                    <svg class="unit-checkmark" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                    </svg>
                  {/if}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

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
  .sheet { width: 100%; max-width: 100%; margin: 0; background: #fff; color: #111827; padding: 16px; border-radius: 16px 16px 0 0; box-sizing: border-box; display: grid; gap: 12px; box-shadow: 0 -6px 24px rgba(0,0,0,0.08); }
  .sheet h2 { margin: 0 0 4px 0; font-size: 1.1rem; }
  .sheet input { font-size: 1rem; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; width: 100%; box-sizing: border-box; background: #fff; }


  /* Beautiful unit picker */
  .unit-field { display: grid; gap: 8px; margin-bottom: 12px; }
  .unit-label { font-size: 0.95rem; color: #6b7280; font-weight: 500; }
  .unit-selector {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px; font-size: 1.1rem; text-align: left;
    border-radius: 14px; border: 2px solid #e5e7eb;
    background: #ffffff; color: #111827;
    transition: all 0.2s ease;
  }
  .unit-selector:hover { border-color: #d1d5db; }
  .unit-selector:focus { outline: none; border-color: #111827; box-shadow: 0 0 0 4px rgba(17,24,39,0.08); }
  .unit-text { flex: 1; }
  .unit-chevron { width: 20px; height: 20px; color: #9ca3af; transition: transform 0.2s ease; }
  .unit-selector:active .unit-chevron { transform: rotate(180deg); }

  /* Full-screen picker overlay */
  .unit-picker-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: flex-end;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* Picker panel */
  .unit-picker {
    width: 100%; background: #ffffff;
    border-radius: 20px 20px 0 0;
    max-height: 80vh; display: flex; flex-direction: column;
    animation: slideUp 0.3s ease;
  }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

  /* Picker header */
  .unit-picker-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #f3f4f6;
    background: #fafafa; border-radius: 20px 20px 0 0;
  }
  .unit-picker-cancel {
    font-size: 1rem; color: #ef4444; background: none; border: none;
    padding: 8px; margin: -8px;
  }
  .unit-picker-title {
    font-size: 1.1rem; font-weight: 600; color: #111827; margin: 0;
  }
  .unit-picker-spacer { width: 60px; }

  /* Picker content */
  .unit-picker-content {
    flex: 1; overflow-y: auto; padding: 8px 16px 24px;
    -webkit-overflow-scrolling: touch;
  }

  /* Unit groups */
  .unit-group { margin-bottom: 24px; }
  .unit-group-title {
    font-size: 0.9rem; font-weight: 600; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin: 0 0 12px 4px;
  }
  .unit-options { display: grid; gap: 8px; }

  /* Unit options */
  .unit-option {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 16px; font-size: 1.1rem; text-align: left;
    border-radius: 14px; border: 2px solid transparent;
    background: #f9fafb; color: #111827;
    transition: all 0.15s ease;
  }
  .unit-option:hover { background: #f3f4f6; }
  .unit-option:active { background: #e5e7eb; transform: scale(0.98); }
  .unit-option.selected {
    background: #111827; color: #ffffff;
    border-color: #111827;
  }
  .unit-checkmark {
    width: 20px; height: 20px; color: #ffffff;
    opacity: 0; transform: scale(0.8);
    transition: all 0.2s ease;
  }
  .unit-option.selected .unit-checkmark {
    opacity: 1; transform: scale(1);
  }

  .btn[disabled] { opacity: 0.5; pointer-events: none; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .row-2 { display: flex; justify-content: flex-end; gap: 8px; }
  .btn { padding: 10px 14px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; }
  .btn.primary { background: #111827; border-color: #111827; color: #fff; }
  .btn.ghost { background: #fff; }
</style>


