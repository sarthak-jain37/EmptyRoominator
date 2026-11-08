<script lang="ts">
  import ThemeToggle from "./ThemeToggle.svelte";

  let { currentTab, onSelectTab }: { currentTab: "search" | "explore"; onSelectTab: (tab: "search" | "explore") => void } = $props();
</script>

<header class="navbar">
  <div class="nav-container">
    <div class="nav-top-row">
      <div class="brand">
        <div class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
            <path d="M9 3v18"></path>
            <path d="M14 9h4"></path>
            <path d="M14 15h4"></path>
          </svg>
        </div>
        <span class="brand-name">EmptyRoominator</span>
      </div>

      <div class="desktop-actions">
        <nav class="nav-links" aria-label="Main Navigation">
          <button
            type="button"
            class="nav-tab"
            class:active={currentTab === "search"}
            onclick={() => onSelectTab("search")}
          >
            Find a Room
          </button>
          <button
            type="button"
            class="nav-tab"
            class:active={currentTab === "explore"}
            onclick={() => onSelectTab("explore")}
          >
            Explore Rooms
          </button>
        </nav>

        <div class="divider"></div>

        <ThemeToggle />
      </div>

      <div class="mobile-theme-toggle">
        <ThemeToggle />
      </div>
    </div>

    <div class="mobile-nav-bar">
      <nav class="nav-links mobile-links" aria-label="Mobile Navigation">
        <button
          type="button"
          class="nav-tab"
          class:active={currentTab === "search"}
          onclick={() => onSelectTab("search")}
        >
          Find a Room
        </button>
        <button
          type="button"
          class="nav-tab"
          class:active={currentTab === "explore"}
          onclick={() => onSelectTab("explore")}
        >
          Explore Rooms
        </button>
      </nav>
    </div>
  </div>
</header>

<style>
  .navbar {
    width: 100%;
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-surface);
    position: sticky;
    top: 0;
    z-index: 40;
    backdrop-filter: blur(8px);
  }

  .nav-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0.75rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .brand-name {
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .desktop-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .mobile-theme-toggle {
    display: none;
  }

  .mobile-nav-bar {
    display: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    background: var(--bg-surface-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 2px;
    gap: 2px;
  }

  .nav-tab {
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.825rem;
    font-weight: 500;
    padding: 5px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .nav-tab:hover {
    color: var(--text-primary);
  }

  .nav-tab.active {
    background: var(--bg-surface);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .divider {
    width: 1px;
    height: 20px;
    background: var(--border-subtle);
  }

  /* Responsive Mobile Adaptation */
  @media (max-width: 640px) {
    .nav-container {
      padding: 0.6rem 1rem;
      gap: 0.5rem;
    }

    .brand-name {
      font-size: 0.95rem;
    }

    .desktop-actions {
      display: none;
    }

    .mobile-theme-toggle {
      display: block;
    }

    .mobile-nav-bar {
      display: block;
      width: 100%;
    }

    .mobile-links {
      width: 100%;
      display: flex;
    }

    .mobile-links .nav-tab {
      flex: 1;
      text-align: center;
      padding: 6px 0;
      font-size: 0.8rem;
    }
  }
</style>
