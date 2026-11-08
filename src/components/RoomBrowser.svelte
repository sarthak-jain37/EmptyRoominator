<script lang="ts">
  import type { TimetableData } from "$lib/types";
  import { DAYS, DAY_NAMES } from "$lib/time";

  let {
    timetable,
    onSelectRoom
  }: {
    timetable: TimetableData;
    onSelectRoom: (room: string, block: string, day: string) => void;
  } = $props();

  const blocks = $derived(Object.keys(timetable).sort());
  let selectedBlock = $state("A");
  let selectedDay = $state("Mon");
  let searchQuery = $state("");

  // Ensure selectedBlock is valid once blocks load
  $effect(() => {
    if (blocks.length > 0 && !blocks.includes(selectedBlock)) {
      selectedBlock = blocks[0];
    }
  });

  const roomsInBlock = $derived.by(() => {
    if (!timetable[selectedBlock]) return [];
    const list = Object.keys(timetable[selectedBlock]).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    if (!searchQuery.trim()) return list;
    return list.filter((r) => r.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  });

  function getClassesCount(room: string): number {
    const dayData = timetable[selectedBlock]?.[room]?.[selectedDay];
    return dayData?.classes?.length || 0;
  }
</script>

<div class="browser-container">
  <div class="browser-controls">
    <!-- Block Tabs -->
    <div class="control-group">
      <span class="control-label">Select Block:</span>
      <div class="block-pills" role="tablist">
        {#each blocks as b}
          <button
            type="button"
            class="pill-btn"
            class:active={selectedBlock === b}
            onclick={() => { selectedBlock = b; }}
            role="tab"
            aria-selected={selectedBlock === b}
          >
            {b} Block
          </button>
        {/each}
      </div>
    </div>

    <!-- Day Selector & Search Input -->
    <div class="sub-controls">
      <div class="day-group">
        <span class="control-label">Day:</span>
        <div class="day-pills">
          {#each DAYS as d}
            <button
              type="button"
              class="day-pill"
              class:active={selectedDay === d}
              onclick={() => { selectedDay = d; }}
              title={DAY_NAMES[d]}
            >
              {d}
            </button>
          {/each}
        </div>
      </div>

      <div class="filter-input-wrap">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Filter room name..."
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button type="button" class="clear-btn" onclick={() => { searchQuery = ""; }}>×</button>
        {/if}
      </div>
    </div>
  </div>

  <!-- Room Grid -->
  <div class="rooms-grid">
    {#each roomsInBlock as room}
      {@const count = getClassesCount(room)}
      <button
        type="button"
        class="explore-card"
        onclick={() => onSelectRoom(room, selectedBlock, selectedDay)}
      >
        <div class="card-top">
          <span class="room-name">{room}</span>
          <span class="class-count-tag" class:zero={count === 0}>
            {count} {count === 1 ? 'class' : 'classes'}
          </span>
        </div>
        <div class="card-bottom">
          <span class="view-schedule-hint">View {selectedDay} schedule →</span>
        </div>
      </button>
    {:else}
      <div class="no-rooms-msg">
        No rooms found matching "{searchQuery}" in {selectedBlock} Block.
      </div>
    {/each}
  </div>
</div>

<style>
  .browser-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .browser-controls {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .control-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .block-pills {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .pill-btn {
    border: 1px solid var(--border-subtle);
    background: var(--bg-surface-secondary);
    color: var(--text-secondary);
    font-size: 0.825rem;
    font-weight: 500;
    padding: 0.35rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .pill-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
  }

  .pill-btn.active {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border-color: var(--btn-primary-bg);
    font-weight: 600;
  }

  .sub-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-subtle);
  }

  .day-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .day-pills {
    display: flex;
    gap: 0.25rem;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 2px;
  }

  .day-pill {
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .day-pill:hover {
    color: var(--text-primary);
  }

  .day-pill.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .filter-input-wrap {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    color: var(--text-muted);
  }

  .filter-input-wrap input {
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.8rem;
    color: var(--text-primary);
    width: 140px;
  }

  .clear-btn {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 1rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.85rem;
  }

  .explore-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .explore-card:hover {
    border-color: var(--border-strong);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .room-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .class-count-tag {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-surface-secondary);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid var(--border-subtle);
  }

  .class-count-tag.zero {
    color: var(--text-muted);
    background: transparent;
  }

  .card-bottom {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .explore-card:hover .view-schedule-hint {
    color: var(--accent-text);
  }

  .no-rooms-msg {
    grid-column: 1 / -1;
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.85rem;
  }
</style>

