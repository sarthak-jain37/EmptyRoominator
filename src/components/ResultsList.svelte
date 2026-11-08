<script lang="ts">
  import type { RoomAvailabilityResult } from "$lib/types";
  import RoomCard from "./RoomCard.svelte";
  import { DAY_NAMES, formatMinutesTo12Hour, timeStringToMinutes } from "$lib/time";

  let {
    results = [],
    selectedBlock = "ALL",
    selectedDay = "Mon",
    startTimeStr = "09:00",
    endTimeStr = "10:00",
    onSelectRoom
  }: {
    results: RoomAvailabilityResult[];
    selectedBlock: string;
    selectedDay: string;
    startTimeStr: string;
    endTimeStr: string;
    onSelectRoom: (room: string, block: string) => void;
  } = $props();

  let sortBy: "longest" | "room" = $state("longest");

  const startFormatted = $derived(formatMinutesTo12Hour(timeStringToMinutes(startTimeStr)));
  const endFormatted = $derived(formatMinutesTo12Hour(timeStringToMinutes(endTimeStr)));
  const dayName = $derived(DAY_NAMES[selectedDay] || selectedDay);
  const blockContext = $derived(selectedBlock === "ALL" ? "All Blocks" : `${selectedBlock} Block`);

  // Count availability
  const totalCount = $derived(results.length);
  const fullCount = $derived(results.filter((r) => r.status === "full").length);
  const partialCount = $derived(results.filter((r) => r.status === "partial").length);

  // Sorted results according to current sortBy
  const sortedResults = $derived.by(() => {
    const list = [...results];
    list.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "full" ? -1 : 1;
      }
      if (sortBy === "room") {
        return a.room.localeCompare(b.room, undefined, { numeric: true });
      }
      if (a.status === "partial" && b.status === "partial") {
        if (b.durationAvailable !== a.durationAvailable) {
          return b.durationAvailable - a.durationAvailable;
        }
      }
      if (a.block !== b.block) {
        return a.block.localeCompare(b.block);
      }
      return a.room.localeCompare(b.room, undefined, { numeric: true });
    });
    return list;
  });

  // Group by block if searching All Blocks
  const groupedByBlock = $derived.by(() => {
    if (selectedBlock !== "ALL") {
      return [{ block: selectedBlock, rooms: sortedResults }];
    }
    const map = new Map<string, RoomAvailabilityResult[]>();
    for (const res of sortedResults) {
      if (!map.has(res.block)) {
        map.set(res.block, []);
      }
      map.get(res.block)!.push(res);
    }
    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => ({
      block: key,
      rooms: map.get(key)!
    }));
  });
</script>

<div class="results-container">
  <!-- Context Bar & Sorting Controls -->
  <div class="results-header">
    <div class="context-info">
      <div class="context-title">
        {dayName} · {startFormatted} – {endFormatted} · {blockContext}
      </div>
      <div class="context-count">
        {totalCount} matching {totalCount === 1 ? 'room' : 'rooms'}
        {#if partialCount > 0}
          <span class="count-breakdown">({fullCount} fully free, {partialCount} partial)</span>
        {/if}
      </div>
    </div>

    <div class="sort-controls">
      <label for="sort-select" class="sort-label">Sort by:</label>
      <div class="select-wrapper">
        <select id="sort-select" bind:value={sortBy}>
          <option value="longest">Longest Available</option>
          <option value="room">Room Number</option>
        </select>
        <div class="select-arrow" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Disclaimer Notice -->
  <div class="disclaimer-banner">
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
    <span>
      Availability is estimated from the published timetable. A room listed as free may still be reserved for another activity or inaccessible.
    </span>
  </div>

  <!-- Room Groups -->
  <div class="groups-stack">
    {#each groupedByBlock as group}
      {#if group.rooms.length > 0}
        <section class="block-section">
          {#if selectedBlock === "ALL"}
            <div class="block-header">
              <h4 class="block-title">{group.block} Block</h4>
              <span class="block-count">{group.rooms.length} {group.rooms.length === 1 ? 'room' : 'rooms'}</span>
            </div>
          {/if}

          <div class="rooms-grid">
            {#each group.rooms as res (res.room)}
              <RoomCard result={res} onClick={onSelectRoom} />
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </div>
</div>

<style>
  .results-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .context-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .context-count {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }

  .count-breakdown {
    color: var(--text-secondary);
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .sort-label {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  select {
    appearance: none;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 0.35rem 1.6rem 0.35rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
  }

  .select-arrow {
    position: absolute;
    right: 0.5rem;
    pointer-events: none;
    color: var(--text-muted);
  }

  .disclaimer-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--text-muted);
  }

  .disclaimer-banner svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--text-secondary);
  }

  .groups-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .block-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .block-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-subtle);
    padding-bottom: 0.35rem;
  }

  .block-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .block-count {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 0.85rem;
  }

  @media (max-width: 640px) {
    .rooms-grid {
      grid-template-columns: 1fr;
    }
    .results-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

