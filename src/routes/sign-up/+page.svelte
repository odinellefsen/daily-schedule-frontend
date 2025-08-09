<script lang="ts">
  import SignUp from 'clerk-sveltekit/client/SignUp.svelte';
</script>

<main class="wrap">
  <SignUp redirectUrl="/" />
</main>

<style>
  .wrap {
    max-width: 28rem;
    margin: 0 auto;
    padding: 16px;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }
</style>


