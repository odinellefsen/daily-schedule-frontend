<script lang="ts">
  const cards = [
    { 
      href: '/food-item', 
      title: 'Food Items', 
      desc: 'Your personal food library',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z',
      color: 'var(--color-accent)'
    },
    { 
      href: '/recipe', 
      title: 'Recipes', 
      desc: 'Build reusable cooking templates',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      color: 'var(--color-secondary)'
    },
    { 
      href: '/meal', 
      title: 'Meals', 
      desc: 'Plan and snapshot what you eat',
      icon: 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.701 2.701 0 003 15.546V6.454c0-1.5 1.5-3 3-3s3 1.5 3 3v2c0 .5.5 1 1 1s1-.5 1-1v-2c0-1.5 1.5-3 3-3s3 1.5 3 3v2c0 .5.5 1 1 1s1-.5 1-1v-2c0-1.5 1.5-3 3-3s3 1.5 3 3v9.092z',
      color: 'var(--color-warning)'
    }
  ];
</script>

<div class="container">
  <header class="page-header">
    <div class="header-content">
      <h1 class="page-title">Food</h1>
      <button class="back-btn" on:click={() => history.back()} aria-label="Go back">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
    </div>
  </header>

  <div class="cards-grid">
    {#each cards as card}
      <a class="food-card" href={card.href} aria-label={card.title}>
        <div class="card-icon" style="background-color: {card.color}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={card.icon}></path>
          </svg>
        </div>
        <div class="card-content">
          <h2 class="card-title">{card.title}</h2>
          <p class="card-desc">{card.desc}</p>
        </div>
        <div class="card-arrow">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </a>
    {/each}
  </div>
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

  .page-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    line-height: 1.2;
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

  /* Cards Grid */
  .cards-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    margin-top: var(--space-lg);
  }

  .food-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-xl);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--shadow-sm);
    transition: all var(--animation-normal);
    position: relative;
    overflow: hidden;
  }

  .food-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%);
    pointer-events: none;
  }

  .food-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-border);
  }

  .food-card:active {
    transform: translateY(0);
    transition-duration: 75ms;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-inverse);
    flex-shrink: 0;
    position: relative;
  }

  .card-icon::before {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    border-radius: inherit;
    opacity: 0.1;
    backdrop-filter: blur(10px);
  }

  .card-icon svg {
    width: 1.5rem;
    height: 1.5rem;
    stroke-width: 2;
    position: relative;
    z-index: 1;
  }

  .card-content {
    min-width: 0;
    flex: 1;
  }

  .card-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 var(--space-xs) 0;
    line-height: 1.3;
  }

  .card-desc {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.4;
  }

  .card-arrow {
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

  .food-card:hover .card-arrow {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: var(--color-text-inverse);
    transform: translateX(2px);
  }

  .card-arrow svg {
    width: 1.25rem;
    height: 1.25rem;
    stroke-width: 2;
  }

  /* Mobile optimizations */
  @media (max-width: 480px) {
    .food-card {
      padding: var(--space-lg);
      gap: var(--space-md);
    }

    .card-icon {
      width: 48px;
      height: 48px;
    }

    .card-icon svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .card-arrow {
      width: 40px;
      height: 40px;
    }

    .card-arrow svg {
      width: 1.125rem;
      height: 1.125rem;
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


