<script lang="ts">
  const cards = [
    { href: '/food-item', title: 'Food Items', desc: 'Your personal food library' },
    { href: '/recipe', title: 'Recipes', desc: 'Build reusable cooking templates' },
    { href: '/meal', title: 'Meals', desc: 'Plan and snapshot what you eat' }
  ];
</script>

<main class="wrap">
  <header class="top">
    <h1>Food</h1>
  </header>

  <section class="grid">
    {#each cards as c}
      <a class="card" href={c.href} aria-label={c.title}>
        <div class="title">{c.title}</div>
        <div class="desc">{c.desc}</div>
        <div class="arrow">→</div>
      </a>
    {/each}
  </section>
</main>

<style>
  :root { color-scheme: light dark; }
  .wrap { max-width: 28rem; margin: 0 auto; padding: 16px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
  .top { display: flex; align-items: baseline; justify-content: space-between; }
  h1 { margin: 0; font-size: 1.25rem; }
  .grid { margin-top: 12px; display: grid; gap: 12px; }
  .card { display: grid; grid-template-columns: 1fr auto; gap: 6px; padding: 14px; border-radius: 14px; text-decoration: none; color: #111827; background: #ffffff; border: 1px solid #e5e7eb; box-shadow: 0 1px 0 rgba(0,0,0,0.04) inset; }
  .title { font-weight: 700; }
  .desc { grid-column: 1 / -1; color: #6b7280; font-size: 0.9rem; }
  .arrow { align-self: center; font-size: 1.2rem; }
</style>


