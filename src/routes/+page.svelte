<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "../components/Navbar.svelte";
  import SearchPanel from "../components/SearchPanel.svelte";
  import ResultsList from "../components/ResultsList.svelte";
  import RoomScheduleModal from "../components/RoomScheduleModal.svelte";
  import RoomBrowser from "../components/RoomBrowser.svelte";
  import EmptyState from "../components/EmptyState.svelte";
  import Footer from "../components/Footer.svelte";

  import type { TimetableData, MultiPhaseTimetableData, PhaseTimetableData, RoomAvailabilityResult, DaySchedule } from "$lib/types";
  import {
    getDefaultTimes,
    minutesToTimeString,
    timeStringToMinutes,
    getCurrentSemesterPhase,
    OPERATING_START,
    OPERATING_END
  } from "$lib/time";
  import { searchAvailableRooms, getRoomDaySchedule } from "$lib/availability";

  // ─── State ──────────────────────────────────────────────────────────────────
  let rawTimetableData: MultiPhaseTimetableData | PhaseTimetableData | null = null;
  let selectedTermPhase: "first_half" | "second_half" = $state("first_half");
  let timetable: TimetableData | null = $state(null);
  let loading = $state(true);
  let loadError = $state("");

  // Tab: "search" or "explore"
  let currentTab: "search" | "explore" = $state("search");

  // Search parameters
  let availableBlocks: string[] = $state([]);
  let selectedBlock = $state("ALL");
  let selectedDay = $state("Mon");
  let startTimeStr = $state("09:00");
  let endTimeStr = $state("10:00");

  // Active search context (frozen to the parameters that were actually searched)
  let activeSearchParams = $state({
    block: "ALL",
    day: "Mon",
    startTimeStr: "09:00",
    endTimeStr: "10:00"
  });

  // Search results
  let searchResults: RoomAvailabilityResult[] = $state([]);
  let searchTriggered = $state(false);

  // Room schedule modal
  let modalRoom: string | null = $state(null);
  let modalBlock: string = $state("");
  let modalDay: string = $state("Mon");
  let modalSchedule: DaySchedule | null = $state(null);

  // ─── Initialize default time & data ──────────────────────────────────────────
  onMount(async () => {
    // 1. Set current time & semester phase defaults
    selectedTermPhase = getCurrentSemesterPhase();
    const defaults = getDefaultTimes();
    selectedDay = defaults.day;
    startTimeStr = minutesToTimeString(defaults.startMinutes);
    endTimeStr = minutesToTimeString(defaults.endMinutes);

    // 2. Fetch timetable.json
    try {
      const res = await fetch("/timetable.json");
      if (!res.ok) {
        throw new Error(`Failed to load timetable data: HTTP ${res.status}`);
      }
      const data = await res.json();
      rawTimetableData = data;

      // Check if schema has first_half / second_half structure
      if (data.first_half && data.second_half) {
        timetable = (data as MultiPhaseTimetableData)[selectedTermPhase];
      } else {
        timetable = data as PhaseTimetableData;
      }

      availableBlocks = Object.keys(timetable).sort();

      // Trigger default search once data is ready
      performSearch();
    } catch (err) {
      loadError = (err as Error).message || "An unexpected error occurred.";
    } finally {
      loading = false;
    }
  });

  // ─── Search Execution ─────────────────────────────────────────────────────────
  function performSearch() {
    if (!timetable) return;
    const startM = timeStringToMinutes(startTimeStr);
    const endM = timeStringToMinutes(endTimeStr);

    activeSearchParams = {
      block: selectedBlock,
      day: selectedDay,
      startTimeStr,
      endTimeStr
    };

    searchResults = searchAvailableRooms(
      timetable,
      selectedBlock,
      selectedDay,
      startM,
      endM
    );
    searchTriggered = true;
  }

  // ─── Modal Inspection ─────────────────────────────────────────────────────────
  function openRoomModal(room: string, block: string, day: string = selectedDay) {
    if (!timetable) return;
    modalRoom = room;
    modalBlock = block;
    modalDay = day;
    modalSchedule = getRoomDaySchedule(timetable, block, room, day);
  }

  function closeModal() {
    modalRoom = null;
    modalSchedule = null;
  }

  // ─── Suggestion Handlers for Empty State ───────────────────────────────────────
  function handleSearchAllBlocks() {
    selectedBlock = "ALL";
    performSearch();
  }

  function handleShorterDuration() {
    const startM = timeStringToMinutes(startTimeStr);
    const newEndM = Math.min(OPERATING_END, startM + 30);
    endTimeStr = minutesToTimeString(newEndM);
    performSearch();
  }

  function handleChangeTime() {
    const startM = timeStringToMinutes(startTimeStr);
    const newStartM = Math.min(OPERATING_END - 60, startM + 60);
    const newEndM = Math.min(OPERATING_END, newStartM + 60);
    startTimeStr = minutesToTimeString(newStartM);
    endTimeStr = minutesToTimeString(newEndM);
    performSearch();
  }
</script>

<Navbar
  {currentTab}
  onSelectTab={(tab) => { currentTab = tab; }}
/>

<main class="page-main">
  <div class="content-container">
    {#if loading}
      <div class="status-center">
        <div class="spinner" aria-hidden="true"></div>
        <p class="status-text">Loading room schedule data...</p>
      </div>
    {:else if loadError}
      <div class="error-banner" role="alert">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div>
          <strong>Unable to load timetable:</strong> {loadError}
        </div>
      </div>
    {:else}
      {#if currentTab === "search"}
        <div class="search-view-layout">
          <SearchPanel
            {availableBlocks}
            bind:selectedBlock
            bind:selectedDay
            bind:startTimeStr
            bind:endTimeStr
            onSearch={performSearch}
          />

          {#if searchTriggered}
            {#if searchResults.length > 0}
              <ResultsList
                results={searchResults}
                selectedBlock={activeSearchParams.block}
                selectedDay={activeSearchParams.day}
                startTimeStr={activeSearchParams.startTimeStr}
                endTimeStr={activeSearchParams.endTimeStr}
                onSelectRoom={(r, b) => openRoomModal(r, b, activeSearchParams.day)}
              />
            {:else}
              <EmptyState
                onSearchAllBlocks={selectedBlock !== "ALL" ? handleSearchAllBlocks : undefined}
                onShorterDuration={handleShorterDuration}
                onChangeTime={handleChangeTime}
              />
            {/if}
          {/if}
        </div>
      {:else}
        {#if timetable}
          <RoomBrowser
            {timetable}
            onSelectRoom={(r, b, d) => openRoomModal(r, b, d)}
          />
        {/if}
      {/if}
    {/if}
  </div>
</main>

{#if modalRoom && modalSchedule}
  <RoomScheduleModal
    room={modalRoom}
    block={modalBlock}
    day={modalDay}
    schedule={modalSchedule}
    onClose={closeModal}
  />
{/if}

<Footer />

<style>
  .page-main {
    flex: 1;
    padding: 2rem 1.25rem 3rem;
  }

  .content-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .search-view-layout {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .status-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 1rem;
    gap: 1rem;
    color: var(--text-muted);
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--border-subtle);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .status-text {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    font-size: 0.875rem;
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    .page-main {
      padding: 1.25rem 1rem 2rem;
    }
  }
</style>
