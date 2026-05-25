export function getStyles() {
  return `
/* ============================================================
   DESIGN TOKENS
   ============================================================ */
:root {
  /* Colors */
  --bg-base:        #080c14;
  --bg-surface:     #0d1220;
  --bg-card:        #111827;
  --bg-card-hover:  #161f30;
  --bg-elevated:    #1a2436;
  --border:         #1e2d47;
  --border-subtle:  #162032;
  --border-hover:   #2d4268;

  --accent:         #3b82f6;
  --accent-dim:     #1d4ed8;
  --accent-glow:    rgba(59,130,246,0.15);
  --accent-text:    #60a5fa;

  --green:          #10b981;
  --green-dim:      rgba(16,185,129,0.1);
  --red:            #ef4444;
  --red-dim:        rgba(239,68,68,0.1);
  --orange:         #f59e0b;
  --orange-dim:     rgba(245,158,11,0.1);
  --purple:         #8b5cf6;
  --purple-dim:     rgba(139,92,246,0.1);
  --yellow:         #eab308;
  --yellow-dim:     rgba(234,179,8,0.1);

  --text-primary:   #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted:     #4b5e7a;
  --text-accent:    #60a5fa;

  /* Typography */
  --font-sans:  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono:  "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;

  --text-xs:    0.72rem;
  --text-sm:    0.82rem;
  --text-base:  0.92rem;
  --text-md:    1rem;
  --text-lg:    1.125rem;
  --text-xl:    1.25rem;
  --text-2xl:   1.5rem;

  /* Spacing */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-sm:  4px;
  --radius:     8px;
  --radius-md:  10px;
  --radius-lg:  14px;
  --radius-xl:  20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
  --shadow:     0 4px 16px rgba(0,0,0,0.5);
  --shadow-lg:  0 8px 32px rgba(0,0,0,0.6);
  --shadow-accent: 0 0 0 1px var(--accent), 0 4px 16px var(--accent-glow);

  /* Transitions */
  --ease:       cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:    cubic-bezier(0.4, 0, 1, 1);
  --t-fast:     120ms;
  --t-base:     200ms;
  --t-slow:     350ms;
}

/* ============================================================
   RESET & BASE
   ============================================================ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  background: var(--bg-base);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Skip nav for accessibility */
.skip-nav {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 600;
  z-index: 9999;
  transition: top var(--t-fast);
}
.skip-nav:focus { top: var(--space-4); }

a { color: var(--text-accent); text-decoration: none; transition: color var(--t-fast); }
a:hover { color: #fff; }
a:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: var(--radius-sm); }

/* ============================================================
   HEADER
   ============================================================ */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(8,12,20,0.85);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border-bottom: 1px solid var(--border-subtle);
  padding: 0 var(--space-6);
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.header-logo {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--accent), var(--purple));
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.header-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.header-subtitle {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: none;
}

@media (min-width: 640px) { .header-subtitle { display: block; } }

.header-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: none;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
@media (min-width: 900px) { .header-meta { display: flex; } }

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  animation: pulse 2s ease infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* Mobile nav toggle */
.nav-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast);
  flex-shrink: 0;
}
.nav-toggle:hover { background: var(--bg-elevated); border-color: var(--border-hover); }
@media (min-width: 900px) { .nav-toggle { display: none; } }

/* ============================================================
   NAVIGATION
   ============================================================ */
.site-nav {
  background: rgba(8,12,20,0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  overflow: hidden;
  /* Desktop: visible */
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav-inner::-webkit-scrollbar { display: none; }

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color var(--t-fast), border-color var(--t-fast);
  text-decoration: none;
}
.nav-link:hover { color: var(--text-primary); border-bottom-color: var(--border-hover); }
.nav-link.active { color: var(--text-primary); border-bottom-color: var(--accent); }
.nav-link .nav-icon { font-size: 13px; }

/* Mobile nav */
@media (max-width: 899px) {
  .site-nav {
    display: none;
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }
  .site-nav.open { display: block; }
  .nav-inner { flex-direction: column; align-items: stretch; padding: var(--space-2) 0; }
  .nav-link {
    padding: var(--space-3) var(--space-6);
    border-bottom: none;
    border-left: 2px solid transparent;
  }
  .nav-link:hover { border-left-color: var(--border-hover); border-bottom: none; }
  .nav-link.active { border-left-color: var(--accent); border-bottom: none; }
}

/* ============================================================
   LAYOUT
   ============================================================ */
.page-wrapper {
  position: relative;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}
@media (max-width: 640px) {
  .main-content { padding: var(--space-6) var(--space-4); gap: var(--space-10); }
}

/* Section */
.section { display: flex; flex-direction: column; gap: var(--space-5); }

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.section-title-group { display: flex; flex-direction: column; gap: var(--space-1); }

.section-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  max-width: 540px;
  line-height: 1.5;
}

.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--border) 0%, transparent 100%);
}

/* ============================================================
   DASHBOARD STATS
   ============================================================ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}
@media (min-width: 640px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  transition: border-color var(--t-base), background var(--t-base), transform var(--t-base);
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 0%, var(--accent-glow), transparent 60%);
  opacity: 0;
  transition: opacity var(--t-base);
}
.stat-card:hover { border-color: var(--border-hover); background: var(--bg-card-hover); transform: translateY(-1px); }
.stat-card:hover::before { opacity: 1; }

.stat-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  font-family: var(--font-mono);
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-sub {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.stat-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: auto;
  align-self: flex-start;
}

/* Activity feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  transition: border-color var(--t-fast), background var(--t-fast);
  animation: slideIn var(--t-slow) var(--ease) both;
}
.activity-item:hover { border-color: var(--border); background: var(--bg-card-hover); }

@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-text {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.activity-text strong { font-weight: 600; color: var(--text-primary); }
.activity-time { font-size: var(--text-xs); color: var(--text-muted); margin-left: auto; white-space: nowrap; }

/* ============================================================
   CARDS
   ============================================================ */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--t-base), background var(--t-base), box-shadow var(--t-base);
  animation: fadeIn var(--t-slow) var(--ease) both;
}
.card:hover { border-color: var(--border-hover); background: var(--bg-card-hover); box-shadow: var(--shadow); }

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.card-highlight {
  border-color: rgba(239,68,68,0.4);
  background: rgba(239,68,68,0.04);
}
.card-highlight:hover { border-color: rgba(239,68,68,0.7); }

.card-header {
  padding: var(--space-4) var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
}
.card:last-child .card-header:only-child,
.card-header:last-child { border-bottom: none; }

.card-title {
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.card-body {
  padding: var(--space-4) var(--space-5);
}

.card-desc {
  padding: var(--space-2) var(--space-5) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.55;
  border-bottom: 1px solid var(--border-subtle);
}

/* ============================================================
   FILE LIST
   ============================================================ */
.file-list {
  list-style: none;
  padding: var(--space-2) var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.file-list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  padding: 2px 0;
}
.file-list li:hover { color: var(--text-primary); }
.file-more {
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: var(--space-1) var(--space-5);
  font-style: italic;
}

/* ============================================================
   BADGES
   ============================================================ */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.6;
}
.badge-blue   { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); }
.badge-green  { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.25); }
.badge-red    { background: rgba(239,68,68,0.15);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
.badge-orange { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.25); }
.badge-purple { background: rgba(139,92,246,0.15); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.25); }
.badge-grey   { background: rgba(100,116,139,0.15); color: #94a3b8; border: 1px solid rgba(100,116,139,0.2); }
.badge-yellow { background: rgba(234,179,8,0.15);  color: #fde68a; border: 1px solid rgba(234,179,8,0.25); }

/* Private aura special badge */
.badge-private-aura {
  background: rgba(239,68,68,0.2);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.5);
  animation: badgePulse 2s ease infinite;
}
@keyframes badgePulse {
  0%,100% { border-color: rgba(239,68,68,0.5); }
  50%      { border-color: rgba(239,68,68,0.9); }
}

.flag-private { color: #fca5a5; background: rgba(239,68,68,0.12); padding: 1px 6px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: var(--text-xs); }

/* ============================================================
   DIFF STATS
   ============================================================ */
.diff-stats {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
.diff-add  { color: var(--green); }
.diff-rem  { color: var(--red); }
.diff-mod  { color: var(--accent-text); }

/* ============================================================
   TABLES
   ============================================================ */
.table-wrapper {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  min-width: 480px;
}
thead { background: var(--bg-elevated); }
th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: middle;
  color: var(--text-secondary);
}
tr:last-child td { border-bottom: none; }
tbody tr { transition: background var(--t-fast); }
tbody tr:hover td { background: var(--bg-elevated); color: var(--text-primary); }

/* ============================================================
   MONOSPACE / CODE
   ============================================================ */
code, .mono {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--text-accent);
  border: 1px solid var(--border-subtle);
}

.version-tag {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: 600;
}

/* ============================================================
   REPO GROUP
   ============================================================ */
.repo-group { display: flex; flex-direction: column; gap: var(--space-3); }
.repo-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
}
.repo-label a { font-size: var(--text-xs); color: var(--text-muted); }
.repo-label a:hover { color: var(--text-secondary); }

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty-state {
  padding: var(--space-12) var(--space-6);
  text-align: center;
  color: var(--text-muted);
  font-size: var(--text-sm);
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}
.empty-icon { font-size: 32px; opacity: 0.4; }
.empty-title { font-weight: 600; color: var(--text-secondary); }

/* ============================================================
   ALERT BANNER
   ============================================================ */
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.55;
}
.alert-red { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
.alert-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

/* ============================================================
   SECTION TABS (repo switcher)
   ============================================================ */
.tab-group {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.tab-btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--t-fast);
}
.tab-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.tab-btn.active { background: var(--accent-glow); border-color: rgba(59,130,246,0.4); color: var(--accent-text); }

/* ============================================================
   FOOTER
   ============================================================ */
footer {
  border-top: 1px solid var(--border-subtle);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: center;
}
footer a { color: var(--text-muted); }
footer a:hover { color: var(--text-secondary); }
.footer-links { display: flex; align-items: center; gap: var(--space-4); flex-wrap: wrap; justify-content: center; }
.footer-sep { color: var(--border); }

/* ============================================================
   RESPONSIVE UTILITIES
   ============================================================ */
.hide-mobile { display: none; }
@media (min-width: 640px) { .hide-mobile { display: initial; } }
.hide-desktop { display: initial; }
@media (min-width: 640px) { .hide-desktop { display: none; } }

.muted { color: var(--text-muted); font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-mono { font-family: var(--font-mono); font-size: 0.88em; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }

/* Stagger animation delay for lists */
.card:nth-child(1)  { animation-delay: 0ms; }
.card:nth-child(2)  { animation-delay: 30ms; }
.card:nth-child(3)  { animation-delay: 60ms; }
.card:nth-child(4)  { animation-delay: 90ms; }
.card:nth-child(5)  { animation-delay: 120ms; }
.card:nth-child(n+6){ animation-delay: 150ms; }

.activity-item:nth-child(1)  { animation-delay: 0ms; }
.activity-item:nth-child(2)  { animation-delay: 50ms; }
.activity-item:nth-child(3)  { animation-delay: 100ms; }
.activity-item:nth-child(4)  { animation-delay: 150ms; }
.activity-item:nth-child(n+5){ animation-delay: 200ms; }

/* ============================================================
   SCROLLBAR
   ============================================================ */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: var(--radius-full); }
::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }

/* ============================================================
   PRINT
   ============================================================ */
@media print {
  .site-header, .site-nav, .nav-toggle { display: none; }
  body { background: #fff; color: #000; }
}
  `;
}
