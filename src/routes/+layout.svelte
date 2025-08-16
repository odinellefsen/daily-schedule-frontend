<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
    import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
    import UserButton from 'clerk-sveltekit/client/UserButton.svelte';

    let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
	<meta name="theme-color" content="#1a1a1a">
</svelte:head>

<div class="app">
  <header class="header">
    <div class="header-content">
      <!-- Server-rendered fallback (works when CSR is disabled) -->
      {#if data?.isAuthed === false}
        <a href="/sign-in" class="auth-link">
          <span class="auth-text">Sign in</span>
          <svg class="auth-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
          </svg>
        </a>
      {:else}
        <span class="spacer"></span>
      {/if}

      <!-- Client components (enhance when CSR is enabled) -->
      <SignedIn>
        <div class="user-button-wrapper">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
      <SignedOut>
        <a href="/sign-in" class="auth-link">
          <span class="auth-text">Sign in</span>
          <svg class="auth-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"></path>
          </svg>
        </a>
      </SignedOut>
    </div>
  </header>

  <main class="main">
    {@render children?.()}
  </main>
</div>

<style>
  /* Design System */
  :global(:root) {
    /* Colors */
    --color-primary: #1a1a1a;
    --color-primary-light: #2d2d2d;
    --color-secondary: #6366f1;
    --color-secondary-light: #8b5cf6;
    --color-accent: #10b981;
    --color-accent-light: #34d399;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    
    /* Surfaces */
    --color-background: #fafafa;
    --color-surface: #ffffff;
    --color-surface-elevated: #ffffff;
    --color-surface-hover: #f8fafc;
    --color-border: #e2e8f0;
    --color-border-light: #f1f5f9;
    
    /* Text */
    --color-text-primary: #0f172a;
    --color-text-secondary: #64748b;
    --color-text-muted: #94a3b8;
    --color-text-inverse: #ffffff;
    
    /* Spacing */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 0.75rem;
    --space-lg: 1rem;
    --space-xl: 1.25rem;
    --space-2xl: 1.5rem;
    --space-3xl: 2rem;
    --space-4xl: 2.5rem;
    --space-5xl: 3rem;
    
    /* Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    
    /* Typography */
    --font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    
    /* Animation */
    --animation-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --animation-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --animation-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Layout */
    --max-width: 28rem;
    --header-height: 3.5rem;
    
    color-scheme: light dark;
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :global(button) {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: all var(--animation-fast);
  }

  :global(input) {
    font-family: inherit;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .app {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 40;
    height: var(--header-height);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--color-border-light);
  }

  .header-content {
    max-width: var(--max-width);
    margin: 0 auto;
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--space-md);
    padding: 0 var(--space-lg);
  }

  .auth-link {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-lg);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--animation-fast);
  }

  .auth-link:hover {
    color: var(--color-primary);
    background-color: var(--color-surface-hover);
  }

  .auth-icon {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .user-button-wrapper {
    display: flex;
    align-items: center;
  }

  .spacer {
    display: inline-block;
    width: 1px;
    height: 1px;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --color-background: #0f172a;
      --color-surface: #1e293b;
      --color-surface-elevated: #334155;
      --color-surface-hover: #475569;
      --color-border: #334155;
      --color-border-light: #1e293b;
      --color-text-primary: #f8fafc;
      --color-text-secondary: #cbd5e1;
      --color-text-muted: #94a3b8;
    }

    .header {
      background: rgba(15, 23, 42, 0.8);
    }
  }

  @supports (height: 100dvh) {
    .app {
      min-height: 100dvh;
    }
  }
</style>
