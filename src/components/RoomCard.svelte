<script lang="ts">
  import type { RoomAvailabilityResult } from "$lib/types";
  import { formatMinutesTo12Hour, formatDuration } from "$lib/time";

  let { result, onClick }: { result: RoomAvailabilityResult; onClick: (room: string, block: string) => void } = $props();

  const isPartial = $derived(result.status === "partial");
  const timeWindowStr = $derived(
    isPartial
      ? `${formatMinutesTo12Hour(result.freeStart)} – ${formatMinutesTo12Hour(result.freeEnd)}`
      : ""
  );
</script>

<div
  class="room-card"
  class:partial={isPartial}
  role="button"
  tabindex="0"
  onclick={() => onClick(result.room, result.block)}
  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && onClick(result.room, result.block)}
  aria-label="{result.room} in {result.block} Block. {isPartial ? `Partially available for ${result.durationAvailable} minutes` : 'Available'}"
>
  <div class="card-header">
    <div class="room-id-group">
      <h3 class="room-id">{result.room}</h3>
      <span class="block-tag">{result.block} Block</span>
    </div>
    <div class="icon-indicator" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
  </div>

  {#if isPartial}
    <div class="partial-details">
      <div class="status-badge-row">
        <span class="partial-badge">PARTIALLY AVAILABLE</span>
        <span class="available-duration">{formatDuration(result.durationAvailable)} available</span>
      </div>

      <div class="partial-time-interval">
        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>{timeWindowStr}</span>
      </div>

      {#if result.nextClassStart}
        <div class="next-class-note">
          Next class begins at {result.nextClassStart}.
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .room-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 1rem 1.15rem;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .room-card:hover {
    border-color: var(--border-strong);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .room-card.partial {
    border-left: 3px solid var(--amber-indicator);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .room-id-group {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .room-id {
    font-size: 1.15rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    margin: 0;
  }

  .block-tag {
    font-size: 0.75rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .icon-indicator {
    color: var(--text-muted);
    opacity: 0.5;
    transition: all 0.15s ease;
  }

  .room-card:hover .icon-indicator {
    opacity: 1;
    color: var(--text-primary);
    transform: translateX(2px);
  }

  .partial-details {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-top: 0.25rem;
    border-top: 1px dashed var(--border-subtle);
  }

  .status-badge-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .partial-badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--amber-indicator);
    background: var(--amber-subtle);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .available-duration {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--amber-indicator);
  }

  .partial-time-interval {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .next-class-note {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
</style>

