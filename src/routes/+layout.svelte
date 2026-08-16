<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

{@render children()}

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }
  :global(body) {
    margin: 0;
    padding: 0;
    background: #07080f;
  }
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
