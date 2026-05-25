// HTML component builders for the blizzard-api-tracker site

export function esc(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toUTCString();
}

function badge(text, color = "grey") {
  return `<span class="badge badge-${color}">${esc(text)}</span>`;
}

function emptyState(icon, title, sub = "") {
  return `<div class="empty-state">
    <div class="empty-icon" aria-hidden="true">${icon}</div>
    <div class="empty-title">${esc(title)}</div>
    ${sub ? `<div>${esc(sub)}</div>` : ""}
  </div>`;
}

const SECTION_SVGS = {
  builds: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L12 4v5L6.5 12 1 9V4L6.5 1Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/></svg>`,
  db2: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><ellipse cx="6.5" cy="3.5" rx="4.5" ry="1.8" stroke="currentColor" stroke-width="1.2"/><path d="M2 3.5v3c0 1 2 1.8 4.5 1.8S11 7.5 11 6.5v-3" stroke="currentColor" stroke-width="1.2"/><path d="M2 6.5v3c0 1 2 1.8 4.5 1.8S11 10.5 11 9.5v-3" stroke="currentColor" stroke-width="1.2"/></svg>`,
  "ui-source": `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M4 4L1.5 6.5 4 9M9 4l2.5 2.5L9 9M7 2.5l-1 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  hotfixes: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v4.5M9.5 2.5l-3 3.5-3-3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 7.5c0 2.2 1.8 4 4 4s4-1.8 4-4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  "spell-flags": `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L2 3v4.5c0 2.5 2 4.5 4.5 5 2.5-.5 4.5-2.5 4.5-5V3L6.5 1.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.5 6.5l1.5 1.5 2.5-2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function sectionWrapper(id, iconBg, title, desc, content) {
  const svg = SECTION_SVGS[id] || "";
  return `
<div class="section" id="${id}">
  <div class="section-header">
    <div class="section-title-group">
      <h2 class="section-title">
        ${svg ? `<span class="section-icon" style="background:${iconBg};color:var(--text-secondary)" aria-hidden="true">${svg}</span>` : ""}
        ${esc(title)}
      </h2>
      <p class="section-desc">${desc}</p>
    </div>
  </div>
  <div class="section-divider"></div>
  ${content}
</div>`;
}

export function buildHeader(lastUpdated) {
  return `<a href="#main-content" class="skip-nav">Skip to content</a>
<header class="site-header">
  <div class="header-brand">
    <div class="header-logo" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 1L13 4.5V10L7 13L1 10V4.5L7 1Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="7" cy="7" r="2" fill="white"/>
      </svg>
    </div>
    <div>
      <div class="header-title">Blizzard API Tracker</div>
      <div class="header-subtitle">WoW Midnight</div>
    </div>
  </div>
  <div class="header-meta">
    <div class="live-dot" title="Auto-updates every 6 hours"></div>
    <span>Updated ${esc(lastUpdated)}</span>
  </div>
  <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="site-nav">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
</header>`;
}

export function buildNav() {
  const links = [
    { href: "#dashboard", label: "Dashboard" },
    { href: "#builds", label: "Builds" },
    { href: "#db2", label: "DB2 Changes" },
    { href: "#ui-source", label: "UI Source" },
    { href: "#hotfixes", label: "Hotfixes" },
    { href: "#spell-flags", label: "Spell Flags" },
  ];
  const linksHtml = links.map(l =>
    `<a href="${l.href}" class="nav-link">${esc(l.label)}</a>`
  ).join("");
  return `
<nav class="site-nav" id="site-nav" role="navigation" aria-label="Site sections">
  <div class="nav-inner">${linksHtml}</div>
</nav>`;
}

export function buildDashboard(uiData, hotfixData, spellData, buildData, db2Data) {
  const latestBuild = buildData?.builds?.[0];
  const spellChangeCount = spellData?.changes?.length || 0;
  const db2ChangeCount = db2Data?.changes?.length || 0;
  const uiCommitCount = uiData?.changes?.length || 0;

  const stats = `
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-label">Latest Build</div>
    <div class="stat-value" style="font-size:var(--text-md)">${latestBuild ? esc(latestBuild.version || latestBuild.build || "?") : "-"}</div>
    <div class="stat-sub">${latestBuild ? timeAgo(latestBuild.created_at) : "No data yet"}</div>
    <div class="stat-indicator" style="background:var(--accent)"></div>
  </div>
  <div class="stat-card">
    <div class="stat-label">Spell Changes</div>
    <div class="stat-value">${spellChangeCount}</div>
    <div class="stat-sub">${spellChangeCount ? "Flag changes detected" : "No changes"}</div>
    <div class="stat-indicator" style="background:${spellChangeCount ? "var(--red)" : "var(--green)"}"></div>
  </div>
  <div class="stat-card">
    <div class="stat-label">DB2 Changes</div>
    <div class="stat-value">${db2ChangeCount}</div>
    <div class="stat-sub">${db2ChangeCount ? "Table rows changed" : "No changes"}</div>
    <div class="stat-indicator" style="background:${db2ChangeCount ? "var(--orange)" : "var(--green)"}"></div>
  </div>
  <div class="stat-card">
    <div class="stat-label">UI Commits</div>
    <div class="stat-value">${uiCommitCount}</div>
    <div class="stat-sub">Across tracked repos</div>
    <div class="stat-indicator" style="background:var(--purple)"></div>
  </div>
</div>`;

  const activities = [];

  for (const b of (buildData?.builds || []).slice(0, 3)) {
    const v = b.version || b.build || "?";
    const prodBadge = b.product === "wow" ? badge("Retail", "blue") : b.product === "wowxptr" ? badge("PTR", "orange") : badge(b.product || "?", "grey");
    activities.push({ ts: new Date(b.created_at).getTime() || 0, dot: "var(--accent)", html: `${prodBadge} <strong>Build ${esc(v)}</strong>`, time: timeAgo(b.created_at), title: formatDate(b.created_at) });
  }

  for (const c of (spellData?.changes || []).slice(0, 3)) {
    const tag = c.privateAuraChanged ? `<span class="badge badge-private-aura">Private Aura</span>` : badge("Flag Change", "orange");
    activities.push({ ts: new Date(c.date).getTime() || 0, dot: c.privateAuraChanged ? "var(--red)" : "var(--orange)", html: `${tag} <strong>${esc(c.name)}</strong> <span style="color:var(--text-muted);font-size:var(--text-xs)">(${c.id})</span>`, time: timeAgo(c.date), title: formatDate(c.date) });
  }

  for (const c of (db2Data?.changes || []).slice(0, 3)) {
    activities.push({ ts: new Date(c.date).getTime() || 0, dot: "var(--purple)", html: `${badge("DB2", "purple")} <strong>${esc(c.table)}</strong> <span class="diff-stats"><span class="diff-add">+${c.added || 0}</span> <span class="diff-rem">-${c.removed || 0}</span> <span class="diff-mod">~${c.modified || 0}</span></span>`, time: timeAgo(c.date), title: formatDate(c.date) });
  }

  for (const c of (uiData?.changes || []).slice(0, 4)) {
    const repoTag = c.repo === "m33kauras-midnight" ? badge("M33kAuras", "orange") : badge("UI Source", "blue");
    activities.push({ ts: new Date(c.date).getTime() || 0, dot: c.repo === "m33kauras-midnight" ? "var(--orange)" : "var(--accent)", html: `${repoTag} <a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.message)}</a>`, time: timeAgo(c.date), title: formatDate(c.date) });
  }

  for (const p of (hotfixData?.posts || []).slice(0, 3)) {
    const sourceTag = p.source === "blizzard-news" ? badge("News", "blue") : badge("Forums", "grey");
    activities.push({ ts: new Date(p.date).getTime() || 0, dot: "var(--green)", html: `${sourceTag} <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>`, time: timeAgo(p.date), title: formatDate(p.date) });
  }

  activities.sort((a, b) => b.ts - a.ts);

  const feed = activities.length
    ? `<div class="activity-feed">${activities.map(a => `
    <div class="activity-item">
      <div class="activity-dot" style="background:${a.dot}"></div>
      <div class="activity-text">${a.html}</div>
      <div class="activity-time" title="${a.title}">${a.time}</div>
    </div>`).join("")}</div>`
    : emptyState("◎", "No activity yet", "Waiting for first workflow run");

  return `
<div class="section" id="dashboard">
  <div class="section-header">
    <div class="section-title-group">
      <h2 class="section-title">Dashboard</h2>
      <p class="section-desc">Live summary of all tracked API changes across builds, spells, DB2 tables, and UI source.</p>
    </div>
  </div>
  <div class="section-divider"></div>
  ${stats}
  <h3 style="font-size:var(--text-xs);font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-top:var(--space-2)">Recent Activity</h3>
  ${feed}
</div>`;
}

export function buildBuildsSection(data) {
  const builds = data?.builds || [];

  if (!builds.length) {
    return sectionWrapper("builds", "var(--accent-glow)", "Game Builds",
      `WoW build versions from <a href="https://wago.tools/builds" target="_blank" rel="noopener">wago.tools</a>. New builds indicate patches or hotfixes pushed by Blizzard.`,
      emptyState("...", "No build data yet", "Waiting for first workflow run"));
  }

  const rows = builds.slice(0, 30).map(b => {
    const v = b.version || b.build || "?";
    const productBadge = b.product === "wow" ? badge("Retail", "blue") : b.product === "wowxptr" ? badge("PTR", "orange") : badge(b.product || "?", "grey");
    return `<tr>
      <td><span class="version-tag">${esc(v)}</span></td>
      <td>${productBadge}</td>
      <td class="muted" title="${formatDate(b.created_at)}">${timeAgo(b.created_at)}</td>
    </tr>`;
  }).join("");

  return sectionWrapper("builds", "var(--accent-glow)", "Game Builds",
    `WoW build versions from <a href="https://wago.tools/builds" target="_blank" rel="noopener">wago.tools</a>. New builds indicate patches or hotfixes pushed by Blizzard.`,
    `<div class="table-wrapper"><table>
      <thead><tr><th>Version</th><th>Product</th><th>Date</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`);
}

export function buildDb2Section(data) {
  const changes = data?.changes || [];

  if (!changes.length) {
    const empty = emptyState("...", "No DB2 changes yet", "Will populate after two consecutive builds are tracked")
      + (data?.lastBuild ? `<p class="muted" style="font-size:var(--text-xs);margin-top:var(--space-3);text-align:center">Last tracked build: <code>${esc(data.lastBuild)}</code></p>` : "");
    return sectionWrapper("db2", "rgba(139,92,246,0.12)", "DB2 Table Changes",
      `Database table diffs between builds via <a href="https://wago.tools" target="_blank" rel="noopener">wago.tools</a>. SpellMisc changes indicate spell attribute/flag updates including Private Aura additions.`,
      empty);
  }

  let content = "";

  if (changes.some(c => c.table === "SpellMisc")) {
    content += `<div class="alert alert-red">
      <span class="alert-icon">!</span>
      <div>SpellMisc changes detected. This table contains spell attributes including the Private Aura flag. Check the Spell Flags section for details.</div>
    </div>`;
  }

  content += `<div style="display:flex;flex-direction:column;gap:var(--space-2)">`;
  content += changes.slice(0, 30).map(c => {
    const sampleHtml = (c.sample || []).slice(0, 2)
      .map(s => `<div class="mono" style="font-size:var(--text-xs);color:var(--text-muted);padding:2px 0;word-break:break-all">${esc(JSON.stringify(s))}</div>`)
      .join("");
    return `<div class="card">
      <div class="card-header">
        ${badge(c.table, "purple")}
        <span class="card-title">${esc(c.reason || "Schema change")}</span>
        <span class="diff-stats">
          <span class="diff-add">+${c.added || 0}</span>
          <span class="diff-rem">-${c.removed || 0}</span>
          <span class="diff-mod">~${c.modified || 0}</span>
        </span>
        <span class="muted hide-mobile">${esc(c.from || "")} &rarr; ${esc(c.to || "")}</span>
        <span class="muted" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
      </div>
      ${sampleHtml ? `<div class="card-body" style="padding-top:var(--space-2)">${sampleHtml}</div>` : ""}
    </div>`;
  }).join("");
  content += `</div>`;

  if (data.lastBuild) {
    content += `<p class="muted" style="font-size:var(--text-xs);margin-top:var(--space-3)">Last compared build: <code>${esc(data.lastBuild)}</code></p>`;
  }

  return sectionWrapper("db2", "rgba(139,92,246,0.12)", "DB2 Table Changes",
    `Database table diffs between builds via <a href="https://wago.tools" target="_blank" rel="noopener">wago.tools</a>. SpellMisc changes indicate spell attribute/flag updates including Private Aura additions.`,
    content);
}

export function buildUiSection(data) {
  const changes = data?.changes || [];

  if (!changes.length) {
    return sectionWrapper("ui-source", "rgba(59,130,246,0.12)", "UI Source & M33kAuras",
      `Tracks <a href="https://github.com/Gethe/wow-ui-source/tree/live" target="_blank" rel="noopener">Gethe/wow-ui-source</a> and <a href="https://github.com/m33shoq/M33kAuras/tree/midnight" target="_blank" rel="noopener">m33shoq/M33kAuras midnight</a>.`,
      emptyState("...", "No commits yet", "Waiting for first workflow run"));
  }

  const byRepo = {};
  for (const c of changes.slice(0, 60)) {
    const key = c.repo || "unknown";
    if (!byRepo[key]) byRepo[key] = [];
    byRepo[key].push(c);
  }

  const repoMeta = {
    "wow-ui-source-live": { label: "WoW UI Source live", badgeColor: "blue", url: "https://github.com/Gethe/wow-ui-source/tree/live" },
    "m33kauras-midnight": { label: "M33kAuras midnight", badgeColor: "orange", url: "https://github.com/m33shoq/M33kAuras/tree/midnight" },
  };

  const sortedRepos = [...new Set(["wow-ui-source-live", "m33kauras-midnight", ...Object.keys(byRepo)])].filter(k => byRepo[k]);

  const content = sortedRepos.map(repoKey => {
    const commits = byRepo[repoKey];
    const meta = repoMeta[repoKey] || { label: repoKey, badgeColor: "grey", url: "#" };

    const cards = commits.slice(0, 20).map(c => {
      const files = (c.files || []).slice(0, 8);
      const fileItems = files.map(f => {
        const statusColor = f.status === "added" ? "green" : f.status === "removed" ? "red" : "blue";
        return `<li>
          ${badge(f.status, statusColor)}
          <span class="mono truncate">${esc(f.filename)}</span>
          <span class="diff-stats" style="margin-left:auto">
            <span class="diff-add">+${f.additions || 0}</span>
            <span class="diff-rem">-${f.deletions || 0}</span>
          </span>
        </li>`;
      }).join("");
      const moreFiles = (c.files?.length || 0) > 8 ? `<li class="file-more">+${c.files.length - 8} more files</li>` : "";

      return `<div class="card">
        <div class="card-header">
          <a href="${esc(c.url)}" target="_blank" rel="noopener" class="mono" style="flex-shrink:0;color:var(--text-muted)">${esc((c.sha || "").slice(0, 7))}</a>
          <span class="card-title">${esc(c.message)}</span>
          <span class="muted hide-mobile" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
        </div>
        ${files.length ? `<ul class="file-list">${fileItems}${moreFiles}</ul>` : ""}
      </div>`;
    }).join("");

    return `<div class="repo-group">
      <div class="repo-label">
        ${badge(meta.label, meta.badgeColor)}
        <a href="${esc(meta.url)}" target="_blank" rel="noopener">${esc(meta.url.replace("https://github.com/", ""))}</a>
      </div>
      ${cards}
    </div>`;
  }).join("");

  return sectionWrapper("ui-source", "rgba(59,130,246,0.12)", "UI Source & M33kAuras",
    `Tracks <a href="https://github.com/Gethe/wow-ui-source/tree/live" target="_blank" rel="noopener">Gethe/wow-ui-source</a> (Lua API, FrameXML) and <a href="https://github.com/m33shoq/M33kAuras/tree/midnight" target="_blank" rel="noopener">m33shoq/M33kAuras midnight</a> (upstream for ThisWeeksAuras).`,
    content);
}

export function buildHotfixSection(data) {
  const posts = data?.posts || [];

  if (!posts.length) {
    return sectionWrapper("hotfixes", "rgba(16,185,129,0.12)", "Hotfix Notes",
      `Blizzard news feed and <a href="https://us.forums.blizzard.com/en/wow/c/release-notes/35" target="_blank" rel="noopener">release notes forum</a> filtered for hotfix and patch notes.`,
      emptyState("...", "No hotfixes found", "Checking Blizzard news and WoW forums"));
  }

  const cards = posts.slice(0, 25).map(p => {
    const sourceTag = p.source === "blizzard-news" ? badge("Blizzard News", "blue") : badge("Forums", "grey");
    const pinnedTag = p.pinned ? ` ${badge("Pinned", "purple")}` : "";
    const meta = p.replyCount ? `<span class="muted">${p.replyCount} replies</span>` : "";
    const desc = p.description ? `<div class="card-desc">${esc(p.description)}</div>` : "";
    return `<div class="card">
      <div class="card-header">
        ${sourceTag}${pinnedTag}
        <a href="${esc(p.url)}" target="_blank" rel="noopener" class="card-title">${esc(p.title)}</a>
        ${meta}
        <span class="muted" title="${formatDate(p.date)}">${timeAgo(p.date)}</span>
      </div>
      ${desc}
    </div>`;
  }).join("");

  return sectionWrapper("hotfixes", "rgba(16,185,129,0.12)", "Hotfix Notes",
    `Blizzard news feed and <a href="https://us.forums.blizzard.com/en/wow/c/release-notes/35" target="_blank" rel="noopener">release notes forum</a> filtered for hotfix and patch notes.`,
    cards);
}

export function buildSpellSection(data) {
  const changes = data?.changes || [];
  const spells = data?.spells || {};
  const spellCount = Object.keys(spells).length;
  const privateAuraChanges = changes.filter(c => c.privateAuraChanged);

  let content = "";

  if (privateAuraChanges.length) {
    content += `<div class="alert alert-red">
      <span class="alert-icon">!</span>
      <div><strong>${privateAuraChanges.length} Private Aura change${privateAuraChanges.length > 1 ? "s" : ""} detected.</strong> Private Aura flags prevent addons from reading certain debuffs via the WoW API - this directly affects WeakAuras and interrupt trackers.</div>
    </div>`;
  }

  if (changes.length) {
    content += `<div style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-5)">`;
    content += changes.slice(0, 30).map(c => {
      const isPrivate = c.privateAuraChanged;
      const addedItems = (c.added || []).map(f => `<li>${badge("added", "green")} <code>${esc(f)}</code></li>`).join("");
      const removedItems = (c.removed || []).map(f => `<li>${badge("removed", "red")} <code>${esc(f)}</code></li>`).join("");
      return `<div class="card${isPrivate ? " card-highlight" : ""}">
        <div class="card-header">
          ${isPrivate ? `<span class="badge badge-private-aura">PRIVATE AURA</span>` : badge("Flag Change", "orange")}
          <span class="card-title"><strong>${esc(c.name)}</strong> <span class="muted">(ID: ${c.id})</span></span>
          <span class="muted" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
        </div>
        ${addedItems || removedItems ? `<ul class="file-list">${addedItems}${removedItems}</ul>` : ""}
      </div>`;
    }).join("");
    content += `</div>`;
  } else {
    content += `<div class="card" style="margin-bottom:var(--space-5)">
      <div class="card-body">
        <p style="color:var(--text-muted);font-size:var(--text-sm)">No flag changes detected yet. Baseline captured on first run - changes appear on subsequent runs.</p>
      </div>
    </div>`;
  }

  if (spellCount) {
    const rows = Object.entries(spells).map(([id, spell]) => {
      const flags = (spell.flags || []).map(f => {
        const isPrivate = f === "SPELL_ATTR8_AURA_IS_PRIVATE";
        return `<span class="${isPrivate ? "flag-private" : "mono"}">${esc(f)}</span>`;
      }).join(" ") || `<span class="muted">none</span>`;
      return `<tr>
        <td class="mono">${esc(id)}</td>
        <td>${esc(spell.name || "Unknown")}</td>
        <td>${flags}</td>
        <td class="muted" title="${formatDate(data?.lastChecked)}">${timeAgo(data?.lastChecked)}</td>
      </tr>`;
    }).join("");

    content += `<div>
      <h3 style="font-size:var(--text-xs);font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--space-3)">Watched Spells (${spellCount})</h3>
      <div class="table-wrapper"><table>
        <thead><tr><th>ID</th><th>Name</th><th>Active Flags</th><th>Last Checked</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }

  return sectionWrapper("spell-flags", "rgba(239,68,68,0.12)", "Spell Flag Changes",
    `Monitoring ${spellCount} spells for attribute flag changes. Private Aura flags prevent addons from tracking debuffs - changes here directly affect WeakAuras and interrupt trackers.`,
    content);
}

export function buildFooter() {
  return `
<footer>
  <div class="footer-links">
    <a href="https://wago.tools" target="_blank" rel="noopener">wago.tools</a>
    <span class="footer-sep">·</span>
    <a href="https://github.com/Gethe/wow-ui-source" target="_blank" rel="noopener">Gethe/wow-ui-source</a>
    <span class="footer-sep">·</span>
    <a href="https://github.com/m33shoq/M33kAuras" target="_blank" rel="noopener">m33shoq/M33kAuras</a>
    <span class="footer-sep">·</span>
    <a href="https://worldofwarcraft.blizzard.com/en-us/news" target="_blank" rel="noopener">Blizzard News</a>
  </div>
  <div>Runs every 6 hours via GitHub Actions</div>
</footer>`;
}
