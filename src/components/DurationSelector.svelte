<script lang="ts">
  let { selectedDuration, onSelect }: { selectedDuration: number | null; onSelect: (durationMinutes: number) => void } = $props();

  const presets = [
    { label: "30m", minutes: 30 },
    { label: "1h", minutes: 60 },
    { label: "2h", minutes: 120 },
    { label: "3h", minutes: 180 }
  ];
</script>

<div class="duration-selector" role="group" aria-label="Quick duration selection">
  <span class="prefix-label">Duration:</span>
  {#each presets as p}
    <button
      type="button"
      class="preset-btn"
      class:selected={selectedDuration === p.minutes}
      onclick={() => onSelect(p.minutes)}
    >
      {p.label}
    </button>
  {/each}
</div>

<style>
  .duration-selector {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .prefix-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-right: 0.2rem;
  }

  .preset-btn {
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface-secondary);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover {
    border-color: var(--border-strong);
    color: var(--text-primary);
  }

  .preset-btn.selected {
    background: var(--accent-subtle);
    color: var(--accent-text);
    border-color: var(--accent-border);
    font-weight: 600;
  }
</style>

