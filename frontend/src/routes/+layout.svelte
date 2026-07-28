<!-- frontend/src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  // Svelte 5 snippet prop declaration
  let { children }: { children: Snippet } = $props();
</script>

<div class="app-layout">
  <header class="header">
    <div class="header-content">
      <h1>SpaceMatrix</h1>
      <p>Next-generation commercial space directory and leasing portal.</p>
    </div>
  </header>

  <!-- Svelte 5 render tag replacing <slot /> -->
  {@render children()}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
  }

  .app-layout {
    min-height: 100vh;
  }

  .header {
    background: #0f172a;
    color: #ffffff;
    padding: 3rem 1.5rem;
    text-align: center;
  }

  .header-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
    font-weight: 800;
    letter-spacing: -0.025em;
  }

  .header-content p {
    margin: 0;
    color: #94a3b8;
    font-size: 1.1rem;
  }
</style>