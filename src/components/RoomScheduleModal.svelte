<script lang="ts">
  import { onMount } from "svelte";
  import type { DaySchedule, ClassSession } from "$lib/types";
  import { DAY_NAMES } from "$lib/time";

  let {
    room,
    block,
    day,
    schedule,
    onClose
  }: {
    room: string;
    block: string;
    day: string;
    schedule: DaySchedule;
    onClose: () => void;
  } = $props();

  let dialogEl: HTMLDivElement | null = $state(null);

  // Close on Escape key
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }
  }

  // Prevent background scrolling while modal is open
  onMount(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Formatter for class time display
  function formatClassInterval(start: string, end: string): string {
    return `${start} – ${end}`;
  }

  const dayLabel = $derived(DAY_NAMES[day] || day);
  const classes = $derived(schedule.classes || []);
</script>

<div
  class="modal-backdrop"
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-room-title"
  tabindex="-1"
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === "Escape" && onClose()}
>
  <div class="modal-card" bind:this={dialogEl}>
    <!-- Header -->
    <div class="modal-header">
      <div class="header-left">
        <h2 id="modal-room-title" class="room-title">{room}</h2>
        <span class="block-badge">{block} Block · {dayLabel}</span>
      </div>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Close schedule modal">
        <span>Close</span>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Body / Classes List -->
    <div class="modal-content">
      {#if classes.length === 0}
        <div class="empty-day-state">
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.5" fill="none">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
          <p class="empty-title">No scheduled classes on {dayLabel}</p>
          <p class="empty-desc">This room is completely free from 8:00 AM to 8:00 PM.</p>
        </div>
      {:else}
        <div class="classes-stack">
          {#each classes as item, index}
            <div class="class-card">
              <div class="class-meta">
                <span class="meta-day">{day}</span>
                <span class="meta-dot">•</span>
                <span class="meta-time">{formatClassInterval(item.start, item.end)}</span>
              </div>
              <div class="class-main">
                <div class="course-line">
                  <span class="course-code">{item.code}</span>
                  {#if item.title}
                    <span class="course-title">{item.title}</span>
                  {/if}
                </div>
                {#if item.prof}
                  <div class="prof-line">
                    <span class="prof-label">Instructor:</span> {item.prof}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow-y: auto;
  }

  .modal-card {
    background: var(--modal-bg);
    border: 1px solid var(--modal-border);
    border-radius: 14px;
    width: 100%;
    max-width: 520px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    overflow: hidden;
    animation: modalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modalIn {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-subtle);
  }

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
  }

  .room-title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0;
  }

  .block-badge {
    font-size: 0.8rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .close-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-strong);
  }

  .modal-content {
    padding: 1.25rem 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .classes-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .class-card {
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .class-meta {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-muted);
  }

  .meta-dot {
    opacity: 0.5;
  }

  .course-line {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .course-code {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .course-title {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .prof-line {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 0.15rem;
  }

  .prof-label {
    font-weight: 500;
  }

  .empty-day-state {
    padding: 2.5rem 1rem;
    text-align: center;
    color: var(--text-muted);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-day-state svg {
    opacity: 0.4;
  }

  .empty-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .empty-desc {
    font-size: 0.8rem;
    margin: 0;
  }

  @media (max-width: 640px) {
    .modal-card {
      max-height: 90vh;
      border-radius: 12px;
    }
    .modal-header {
      padding: 1rem 1.25rem;
    }
    .modal-content {
      padding: 1rem 1.25rem;
    }
  }
</style>
