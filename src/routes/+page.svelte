<script lang="ts">
  import { onMount } from "svelte";
  import type { ScheduleData, FreeRoom, ScheduleEntry } from "$lib/types";
  import {
    findFreeRooms,
    timeToMinutes,
    minutesToTime,
    getRoomSchedule,
  } from "$lib/roomFinder";
  import type { TimeQuery } from "$lib/roomFinder";

  // ─── State ───────────────────────────────────────────────────────────────────
  let scheduleData: ScheduleData | null = $state(null);
  let loading = $state(true);
  let loadError = $state("");



  // Search filters
  let selectedDays: string[] = $state(["Mon"]);
  let dayQueries: Record<string, { start: string; end: string }> = $state({
    Mon: { start: "09:00", end: "11:00" },
    Tue: { start: "09:00", end: "11:00" },
    Wed: { start: "09:00", end: "11:00" },
    Thu: { start: "09:00", end: "11:00" },
    Fri: { start: "09:00", end: "11:00" },
    Sat: { start: "09:00", end: "11:00" },
  });
  let termFilter = $state("Any");
  let componentFilter: string[] = $state(["LEC", "TUT", "PRAC"]);
  let minCapacity = $state(0);
  let searchTriggered = $state(false);

  // Results
  let freeRooms: FreeRoom[] = $state([]);
  let filteredRooms: FreeRoom[] = $state([]);
  let searchLoading = $state(false);

  // Room detail modal
  let selectedRoom: string | null = $state(null);
  let roomDaySchedule: ScheduleEntry[] = $state([]);

  // Sorting
  let sortBy: "capacity" | "name" = $state("capacity");
  let sortDir: "asc" | "desc" = $state("desc");

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const TERMS = [
    "Any",
    "Full semester",
    "First half",
    "Second half",
    "Both half",
  ];
  const COMPONENTS = ["LEC", "TUT", "PRAC"];

  // ─── Load bundled data ────────────────────────────────────────────────────────
  onMount(async () => {
    try {
      const res = await fetch("/schedule_data.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      scheduleData = await res.json();
    } catch (e) {
      loadError = `Failed to load bundled data: ${(e as Error).message}`;
    } finally {
      loading = false;
    }
  });



  // ─── Search ────────────────────────────────────────────────────────────────────
  function search() {
    if (!scheduleData) return;
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    searchLoading = true;
    searchTriggered = true;
    freeRooms = [];

    // Use setTimeout to allow UI to update to loading state
    setTimeout(() => {
      try {
        const queries = selectedDays.map((day) => {
          const qStart = timeToMinutes(dayQueries[day].start);
          const qEnd = timeToMinutes(dayQueries[day].end);
          return { day, start: qStart, end: qEnd };
        });

        for (const q of queries) {
          if (isNaN(q.start) || isNaN(q.end) || q.start >= q.end) {
            alert(
              `Please enter a valid time range for ${q.day} where end time is after start time.`,
            );
            searchLoading = false;
            return;
          }
        }

        freeRooms = findFreeRooms(
          scheduleData!,
          queries,
          termFilter,
          componentFilter,
        );
        applyFilters();
      } catch (err) {
        console.error(err);
      } finally {
        searchLoading = false;
      }
    }, 50);
  }

  function applyFilters() {
    filteredRooms = freeRooms.filter((r) => r.capacity >= minCapacity);
    applySorting();
  }

  function applySorting() {
    filteredRooms = [...filteredRooms].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "capacity") cmp = b.capacity - a.capacity;
      else cmp = a.room.localeCompare(b.room);
      return sortDir === "asc" ? -cmp : cmp;
    });
  }

  function toggleSort(col: "capacity" | "name") {
    if (sortBy === col) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortBy = col;
      sortDir = col === "capacity" ? "desc" : "asc";
    }
    applySorting();
  }

  function toggleComponent(comp: string) {
    if (componentFilter.includes(comp)) {
      componentFilter = componentFilter.filter((c) => c !== comp);
    } else {
      componentFilter = [...componentFilter, comp];
    }
  }

  function toggleDay(day: string) {
    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter((d) => d !== day);
    } else {
      selectedDays = [...selectedDays, day];
    }
  }

  // ─── Room detail ──────────────────────────────────────────────────────────────
  function openRoomDetail(room: string) {
    if (!scheduleData) return;
    selectedRoom = room;
    roomDaySchedule = getRoomSchedule(scheduleData, room, selectedDays);
  }

  function closeModal() {
    selectedRoom = null;
  }
</script>

<svelte:head>
  <title>EmptyRoominator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
    rel="stylesheet"
  />

</svelte:head>

<div class="app">
  <div class="container">
    <header class="hero">
      <h1>EmptyRoominator</h1>
    </header>

    <div class="card data-card">
      <div class="card-row">
        <div class="data-status">
          {#if loading}
            <span class="text-muted">Loading timetable data…</span>
          {:else if loadError}
            <span class="text-secondary">{loadError}</span>
          {:else if scheduleData}
            <span class="text-muted">
              Loaded {Object.keys(scheduleData.roomCapacities).length} rooms
            </span>
          {/if}
        </div>
      </div>
    </div>

    <div class="card search-card">
      <div class="filters-grid">
        <div class="field">
          <span class="field-label">Days & Times</span>
          <div class="day-rows">
            {#each DAYS as day}
              <div class="day-row">
                <button
                  class="pill day-pill {selectedDays.includes(day)
                    ? 'active'
                    : ''}"
                  onclick={() => toggleDay(day)}>{day}</button
                >
                {#if selectedDays.includes(day)}
                  <div class="time-inputs">
                    <input
                      type="time"
                      class="input"
                      bind:value={dayQueries[day].start}
                    />
                    <span class="text-muted">–</span>
                    <input
                      type="time"
                      class="input"
                      bind:value={dayQueries[day].end}
                    />
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <div class="field">
          <label for="term-select">Term</label>
          <select id="term-select" class="input" bind:value={termFilter}>
            {#each TERMS as t}
              <option value={t}>{t === "Any" ? "Any Period" : t}</option>
            {/each}
          </select>
        </div>

        <div class="field">
          <span class="field-label">Show Room Types</span>
          <div class="pills">
            {#each COMPONENTS as comp}
              <button
                class="pill {componentFilter.includes(comp) ? 'active' : ''}"
                onclick={() => toggleComponent(comp)}>{comp}</button
              >
            {/each}
          </div>
        </div>

        <div class="field">
          <label for="min-cap">Min Capacity ({minCapacity || "Any"})</label>
          <input
            id="min-cap"
            type="range"
            class="input range"
            min="0"
            max="200"
            step="5"
            bind:value={minCapacity}
            oninput={applyFilters}
          />
        </div>
      </div>

      <button
        class="btn btn-primary search-btn"
        onclick={search}
        disabled={!scheduleData || loading || searchLoading}
      >
        {#if searchLoading}
          Searching...
        {:else}
          Find Free Rooms
        {/if}
      </button>
    </div>

    {#if searchTriggered}
      <div class="results">
        <div class="results-header">
          <h2 class="text-secondary">{filteredRooms.length} rooms free</h2>
          {#if filteredRooms.length > 0}
            <div class="sort-controls">
              <button
                class="pill {sortBy === 'capacity' ? 'active' : ''}"
                onclick={() => toggleSort("capacity")}
              >
                Capacity {sortBy === "capacity"
                  ? sortDir === "desc"
                    ? "↓"
                    : "↑"
                  : ""}
              </button>
              <button
                class="pill {sortBy === 'name' ? 'active' : ''}"
                onclick={() => toggleSort("name")}
              >
                Name {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            </div>
          {/if}
        </div>

        <div class="rooms-grid">
          {#each filteredRooms as room}
            <button class="room-card" onclick={() => openRoomDetail(room.room)}>
              <span class="room-name">{room.room}</span>
              <span class="room-cap">{room.capacity} seats</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if selectedRoom}
    <div
      class="modal-overlay"
      onclick={(e) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay"))
          closeModal();
      }}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="0"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>{selectedRoom}</h2>
          <button class="btn btn-sm" onclick={closeModal}>Close</button>
        </div>
        <div class="modal-body">
          {#if roomDaySchedule.length === 0}
            <p class="text-muted">
              No classes scheduled on {selectedDays.join(", ")}.
            </p>
          {:else}
            <div class="timeline">
              {#each roomDaySchedule as slot}
                {@const q = dayQueries[slot.day]}
                {@const qStart = q ? timeToMinutes(q.start) : -1}
                {@const qEnd = q ? timeToMinutes(q.end) : -1}
                <div
                  class="timeline-item {qStart >= 0 &&
                  slot.start < qEnd &&
                  slot.end > qStart
                    ? 'conflict'
                    : ''}"
                >
                  <span class="text-secondary font-mono"
                    >{slot.day} • {minutesToTime(slot.start)} – {minutesToTime(
                      slot.end,
                    )}</span
                  >
                  <span>{slot.course} • {slot.component}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(:root) {
    --bg: #000000;
    --bg-card: #0a0a0a;
    --bg-hover: #111111;
    --bg-input: #080808;
    --text: #ffffff;
    --text-secondary: #888888;
    --text-muted: #555555;
    --border: #222222;
    --border-hover: #333333;
    --font: "Inter", -apple-system, sans-serif;
    --font-mono: monospace;
    --radius: 8px;
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  :global(body) {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    line-height: 1.5;
  }

  .app {
    min-height: 100vh;
    padding: 3rem 1.5rem;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .hero h1 {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
  }
  .card-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    font-size: 0.85rem;
  }
  .btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-hover);
  }
  .btn-sm {
    padding: 0.35rem 0.6rem;
    font-size: 0.75rem;
  }
  .btn-primary {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
    font-weight: 500;
  }
  .btn-primary:hover {
    background: var(--text-secondary);
    border-color: var(--text-secondary);
  }

  .filters-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .field label, .field-label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .input {
    width: 100%;
    padding: 0.75rem;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
  }
  .input:focus {
    outline: none;
    border-color: var(--text-muted);
  }

  .day-rows {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .day-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .day-pill {
    min-width: 52px;
    text-align: center;
  }
  .time-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }
  .time-inputs .input {
    flex: 1;
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pill {
    padding: 0.4rem 0.8rem;
    background: var(--bg-input);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
  }
  .pill.active {
    background: var(--text);
    color: var(--bg);
    border-color: var(--text);
  }

  .search-btn {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .sort-controls {
    display: flex;
    gap: 0.5rem;
  }

  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  .room-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    cursor: pointer;
    text-align: left;
  }
  .room-card:hover {
    border-color: var(--border-hover);
    background: var(--bg-hover);
  }
  .room-name {
    font-weight: 500;
    font-size: 1.1rem;
  }
  .room-cap {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .text-muted {
    color: var(--text-muted);
  }
  .text-secondary {
    color: var(--text-secondary);
  }
  .font-mono {
    font-family: var(--font-mono);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1.5rem;
  }
  .modal {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    width: 100%;
    max-width: 500px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .timeline-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-input);
  }
  .timeline-item.conflict {
    border-color: #555;
  }
</style>
