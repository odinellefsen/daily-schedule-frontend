<script lang="ts">
  import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
</script>

<main class="wrap">
  <SignIn redirectUrl="/" />
</main>

<style>
  .wrap {
    max-width: 28rem;
    margin: 0 auto;
    padding: 16px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }
</style>


