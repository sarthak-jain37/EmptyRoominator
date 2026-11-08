<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";
  import { theme } from "$lib/theme";

  let { children }: { children: Snippet } = $props();

  onMount(() => {
    theme.init();
  });
</script>

<svelte:head>
  <title>EmptyRoominator</title>
  <meta name="description" content="Find empty classrooms to sit, study or work in between classes." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="app-root">
  {@render children()}
</div>

<style>
  :global(:root) {
    --bg-page: #f8fafc;
    --bg-surface: #ffffff;
    --bg-surface-secondary: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --border-subtle: #e2e8f0;
    --border-strong: #cbd5e1;

    --btn-primary-bg: #0f172a;
    --btn-primary-text: #ffffff;

    --accent-subtle: #e0e7ff;
    --accent-border: #818cf8;
    --accent-text: #4338ca;

    --amber-indicator: #d97706;
    --amber-subtle: #fef3c7;

    --modal-bg: #ffffff;
    --modal-border: #cbd5e1;

    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color-scheme: light;
  }

  :global(:root.dark) {
    --bg-page: #090a0f;
    --bg-surface: #12131a;
    --bg-surface-secondary: #1a1b26;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #828ba2;
    --border-subtle: #232533;
    --border-strong: #323547;

    --btn-primary-bg: #ffffff;
    --btn-primary-text: #090a0f;

    --accent-subtle: #1e1b4b;
    --accent-border: #6366f1;
    --accent-text: #a5b4fc;

    --amber-indicator: #f59e0b;
    --amber-subtle: #302008;

    --modal-bg: #12131a;
    --modal-border: #2e3042;

    color-scheme: dark;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(html),
  :global(body) {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
  }

  :global(body) {
    background-color: var(--bg-page);
    color: var(--text-primary);
    min-height: 100vh;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .app-root {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
  }
</style>
