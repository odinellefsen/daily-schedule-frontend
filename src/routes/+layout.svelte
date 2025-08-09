<script lang="ts">
    import favicon from '$lib/assets/favicon.svg';
    import SignedIn from 'clerk-sveltekit/client/SignedIn.svelte';
    import SignedOut from 'clerk-sveltekit/client/SignedOut.svelte';
    import UserButton from 'clerk-sveltekit/client/UserButton.svelte';

    let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

  <header class="hdr">
    <!-- Server-rendered fallback (works when CSR is disabled) -->
    {#if data?.isAuthed === false}
      <a href="/sign-in" class="lnk">Sign in</a>
    {/if}

    <!-- Client components (enhance when CSR is enabled) -->
    <SignedIn>
      <UserButton afterSignOutUrl="/" />
    </SignedIn>
    <SignedOut>
      <a href="/sign-in" class="lnk">Sign in</a>
    </SignedOut>
  </header>

  {@render children?.()}

  <style>
    .hdr { display:flex; justify-content:flex-end; padding: 8px 12px; }
    .lnk { color: inherit; text-decoration: none; font-size: 0.95rem; }
  </style>
