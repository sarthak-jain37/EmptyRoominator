<script lang="ts">
  import { theme } from "$lib/theme";
  import type { Theme } from "$lib/types";

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: "system", label: "System", icon: "auto" },
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" }
  ];

  function selectTheme(t: Theme) {
    theme.set(t);
  }
</script>

<div class="theme-toggle" role="group" aria-label="Theme selector">
  {#each options as opt}
    <button
      type="button"
      class="toggle-btn"
      class:active={$theme === opt.value}
      onclick={() => selectTheme(opt.value)}
      title="{opt.label} theme"
      aria-pressed={$theme === opt.value}
    >
      {#if opt.icon === "sun"}
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else if opt.icon === "moon"}
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      {/if}
      <span class="label">{opt.label}</span>
    </button>
  {/each}
</div>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
    flex-shrink: 0;
  }

  .toggle-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    flex-shrink: 0;
  }

  .toggle-btn svg {
    display: block;
    flex-shrink: 0;
  }

  .toggle-btn:hover {
    color: var(--text-primary);
  }

  .toggle-btn.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 640px) {
    .label {
      display: none;
    }
    .toggle-btn {
      padding: 6px 8px;
    }
  }
</style>
