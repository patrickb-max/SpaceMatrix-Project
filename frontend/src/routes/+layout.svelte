<script lang="ts">
  export let data;
</script>

<div class="app-root">
  <slot />
</div>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
    line-height: 1.5;
  }

  .app-root {
    min-height: 100vh;
  }
</style>