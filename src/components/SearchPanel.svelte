<script lang="ts">
  import DurationSelector from "./DurationSelector.svelte";
  import {
    DAYS,
    DAY_NAMES,
    timeStringToMinutes,
    minutesToTimeString,
    OPERATING_START,
    OPERATING_END
  } from "$lib/time";

  let {
    availableBlocks = [],
    selectedBlock = $bindable("ALL"),
    selectedDay = $bindable("Mon"),
    startTimeStr = $bindable("09:00"),
    endTimeStr = $bindable("10:00"),
    onSearch
  }: {
    availableBlocks: string[];
    selectedBlock: string;
    selectedDay: string;
    startTimeStr: string;
    endTimeStr: string;
    onSearch: () => void;
  } = $props();

  let selectedDuration: number | null = $state(60);
  let userEditedEndTime = $state(false);
  let validationError = $state("");

  // Handle start time change
  function handleStartTimeChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    startTimeStr = val;
    const startM = timeStringToMinutes(val);

    if (!userEditedEndTime) {
      // Preserve 60-minute or selected duration
      const duration = selectedDuration || 60;
      const newEndM = Math.min(OPERATING_END, startM + duration);
      endTimeStr = minutesToTimeString(newEndM);
    }
    validate();
  }

  // Handle end time change
  function handleEndTimeChange(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    endTimeStr = val;
    userEditedEndTime = true;

    // Check if it matches any preset
    const startM = timeStringToMinutes(startTimeStr);
    const endM = timeStringToMinutes(val);
    const diff = endM - startM;
    if ([30, 60, 120, 180].includes(diff)) {
      selectedDuration = diff;
    } else {
      selectedDuration = null;
    }
    validate();
  }

  // Quick duration selection
  function handleDurationSelect(durationMinutes: number) {
    selectedDuration = durationMinutes;
    const startM = timeStringToMinutes(startTimeStr);
    const newEndM = Math.min(OPERATING_END, startM + durationMinutes);
    endTimeStr = minutesToTimeString(newEndM);
    validate();
  }

  function validate(): boolean {
    const startM = timeStringToMinutes(startTimeStr);
    const endM = timeStringToMinutes(endTimeStr);

    if (isNaN(startM) || isNaN(endM)) {
      validationError = "Please enter valid times.";
      return false;
    }

    if (endM <= startM) {
      validationError = "End time must be later than start time.";
      return false;
    }

    if (startM < OPERATING_START || endM > OPERATING_END) {
      validationError = "Times must be within campus operating hours (08:00 AM – 08:00 PM).";
      return false;
    }

    validationError = "";
    return true;
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (validate()) {
      onSearch();
    }
  }
</script>

<div class="search-panel-card">
  <form onsubmit={handleSubmit}>
    <div class="search-grid">
      <!-- Block Selection -->
      <div class="form-group">
        <label for="block-select">Building Block</label>
        <div class="select-wrapper">
          <select id="block-select" bind:value={selectedBlock}>
            <option value="ALL">All Blocks</option>
            {#each availableBlocks as block}
              <option value={block}>{block} Block</option>
            {/each}
          </select>
          <div class="select-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Day Selection -->
      <div class="form-group day-group">
        <label for="day-select">Day</label>
        <div class="day-selector" role="radiogroup" aria-label="Weekday selector">
          {#each DAYS as day}
            <button
              type="button"
              class="day-btn"
              class:active={selectedDay === day}
              onclick={() => { selectedDay = day; }}
              title={DAY_NAMES[day]}
              aria-checked={selectedDay === day}
              role="radio"
            >
              {day}
            </button>
          {/each}
        </div>
      </div>

      <!-- Time Interval Selection -->
      <div class="form-group time-group">
        <div class="time-header">
          <label for="start-time">Time Interval</label>
          <DurationSelector {selectedDuration} onSelect={handleDurationSelect} />
        </div>
        <div class="time-inputs-row">
          <div class="time-input-wrap">
            <span class="time-tag">From</span>
            <input
              id="start-time"
              type="time"
              step="300"
              value={startTimeStr}
              onchange={handleStartTimeChange}
            />
          </div>
          <span class="time-sep">—</span>
          <div class="time-input-wrap">
            <span class="time-tag">To</span>
            <input
              id="end-time"
              type="time"
              step="300"
              value={endTimeStr}
              onchange={handleEndTimeChange}
            />
          </div>
        </div>
      </div>
    </div>

    {#if validationError}
      <div class="validation-message" role="alert">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{validationError}</span>
      </div>
    {/if}

    <div class="action-row">
      <button type="submit" class="primary-btn">
        <span>Find Available Rooms</span>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  </form>
</div>

<style>
  .search-panel-card {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  }

  .search-grid {
    display: grid;
    grid-template-columns: 180px auto 1fr;
    gap: 1.25rem;
    align-items: start;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  select {
    width: 100%;
    appearance: none;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 0.55rem 2rem 0.55rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
  }

  select:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 2px var(--accent-subtle);
  }

  .select-arrow {
    position: absolute;
    right: 0.75rem;
    pointer-events: none;
    color: var(--text-muted);
  }

  .day-selector {
    display: flex;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
  }

  .day-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.45rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
  }

  .day-btn:hover {
    color: var(--text-primary);
  }

  .day-btn.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .time-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .time-inputs-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .time-input-wrap {
    display: flex;
    align-items: center;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 0 0.5rem;
    flex: 1;
    transition: border-color 0.15s ease;
  }

  .time-input-wrap:focus-within {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 2px var(--accent-subtle);
  }

  .time-tag {
    font-size: 0.75rem;
    color: var(--text-muted);
    user-select: none;
    margin-right: 0.25rem;
  }

  input[type="time"] {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.55rem 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    font-family: inherit;
    cursor: pointer;
  }

  .time-sep {
    color: var(--text-muted);
    font-size: 0.875rem;
  }

  .validation-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.6rem 0.85rem;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #ef4444;
    font-size: 0.8rem;
  }

  .action-row {
    margin-top: 1.25rem;
    display: flex;
    justify-content: flex-end;
  }

  .primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--btn-primary-bg);
    color: var(--btn-primary-text);
    border: none;
    border-radius: 8px;
    padding: 0.65rem 1.4rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .primary-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }

  .primary-btn:active {
    transform: translateY(0);
  }

  @media (max-width: 900px) {
    .search-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .action-row {
      margin-top: 1rem;
    }
    .primary-btn {
      width: 100%;
    }
  }
</style>

