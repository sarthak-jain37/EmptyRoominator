<script lang="ts">
  let {
    onSearchAllBlocks,
    onShorterDuration,
    onChangeTime
  }: {
    onSearchAllBlocks?: () => void;
    onShorterDuration?: () => void;
    onChangeTime?: () => void;
  } = $props();
</script>

<div class="empty-state-card">
  <div class="empty-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <line x1="10" y1="14" x2="14" y2="18"></line>
      <line x1="14" y1="14" x2="10" y2="18"></line>
    </svg>
  </div>

  <h3 class="empty-title">No rooms available for this time slot.</h3>
  <p class="empty-desc">All rooms appear to have classes scheduled during the selected window.</p>

  <div class="suggestions-box">
    <span class="suggestions-label">Suggestions:</span>
    <div class="suggestion-actions">
      {#if onSearchAllBlocks}
        <button type="button" class="suggestion-btn" onclick={onSearchAllBlocks}>
          Search All Blocks
        </button>
      {/if}
      {#if onShorterDuration}
        <button type="button" class="suggestion-btn" onclick={onShorterDuration}>
          Try a shorter duration (30 mins)
        </button>
      {/if}
      {#if onChangeTime}
        <button type="button" class="suggestion-btn" onclick={onChangeTime}>
          Change requested time
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .empty-state-card {
    background: var(--bg-surface);
    border: 1px dashed var(--border-strong);
    border-radius: 12px;
    padding: 2.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    max-width: 500px;
    margin: 1.5rem auto;
  }

  .empty-icon {
    color: var(--text-muted);
    opacity: 0.6;
    margin-bottom: 0.25rem;
  }

  .empty-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .empty-desc {
    font-size: 0.825rem;
    color: var(--text-muted);
    margin: 0;
    max-width: 380px;
  }

  .suggestions-box {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .suggestions-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .suggestion-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .suggestion-btn {
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    font-size: 0.775rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .suggestion-btn:hover {
    border-color: var(--border-strong);
    background: var(--accent-subtle);
    color: var(--accent-text);
  }
</style>

