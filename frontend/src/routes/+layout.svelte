<script lang="ts">
  let { children } = $props();
</script>

<main class="app-container">
  {@render children()}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
</style>