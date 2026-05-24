import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const SITE_DIR = path.resolve("site");

function readJson(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

function timeAgo(iso) {
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

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toUTCString();
}

function esc(str) {
  return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function badge(text, color) {
  const colors = { red:"#c0392b", green:"#27ae60", blue:"#2471a3", orange:"#d35400", grey:"#566573", purple:"#7d3c98", yellow:"#b7950b" };
  return `<span class="badge" style="background:${colors[color]||colors.grey}">${esc(text)}</span>`;
}

function card(content, highlight = false) {
  return `<div class="card${highlight ? " card-hl" : ""}">${content}</div>`;
}

// ---- Dashboard summary ----
function buildDashboard(uiData, hotfixData, spellData, buildData, db2Data) {
  const items = [];

  // Latest build
  const latestBuild = buildData?.builds?.[0];
  if (latestBuild) {
    const v = latestBuild.version || latestBuild.build;
    items.push(`<div class="dash-item">${badge("BUILD", "blue")} <strong>${esc(v)}</strong> <span class="muted">${timeAgo(latestBuild.created_at)}</span></div>`);
  }

  // Recent spell flag changes
  const spellChanges = spellData?.changes?.slice(0, 3) || [];
  for (const c of spellChanges) {
    const tag = c.privateAuraChanged ? badge("PRIVATE AURA", "red") : badge("FLAG CHANGE", "orange");
    items.push(`<div class="dash-item">${tag} <strong>${esc(c.name)}</strong> <span class="muted">${timeAgo(c.date)}</span></div>`);
  }

  // Recent DB2 changes
  const db2Changes = db2Data?.changes?.slice(0, 3) || [];
  for (const c of db2Changes) {
    items.push(`<div class="dash-item">${badge("DB2", "purple")} <strong>${esc(c.table)}</strong> +${c.added}/-${c.removed}/~${c.modified} <span class="muted">${timeAgo(c.date)}</span></div>`);
  }

  // Recent UI source commits
  const uiChanges = (uiData?.changes || []).slice(0, 3);
  for (const c of uiChanges) {
    const repoTag = c.repo === "m33kauras-midnight" ? badge("M33kAuras", "orange") : badge("UI Source", "blue");
    items.push(`<div class="dash-item">${repoTag} <a href="${c.url}" target="_blank">${esc(c.message)}</a> <span class="muted">${timeAgo(c.date)}</span></div>`);
  }

  if (!items.length) return "<p class='muted'>No data yet - waiting for first workflow run.</p>";
  return `<div class="dash-grid">${items.join("")}</div>`;
}

// ---- UI Source section ----
function buildUiSection(data) {
  if (!data) return "<p class='muted'>No data yet.</p>";
  const changes = (data.changes || []).slice(0, 40);
  if (!changes.length) return "<p class='muted'>No commits recorded yet.</p>";

  // Group by repo
  const byRepo = {};
  for (const c of changes) {
    const key = c.repo || "unknown";
    if (!byRepo[key]) byRepo[key] = [];
    byRepo[key].push(c);
  }

  return Object.entries(byRepo).map(([repoKey, commits]) => {
    const first = commits[0];
    const repoTag = repoKey === "m33kauras-midnight"
      ? badge("M33kAuras midnight", "orange")
      : badge("WoW UI Source live", "blue");

    const rows = commits.slice(0, 20).map((c) => {
      const files = (c.files || []).slice(0, 8);
      const fileList = files.map((f) => {
        const col = f.status === "added" ? "green" : f.status === "removed" ? "red" : "blue";
        return `<li>${badge(f.status, col)} <code>${esc(f.filename)}</code> <span class="muted">+${f.additions}/-${f.deletions}</span></li>`;
      }).join("");
      const more = c.files?.length > 8 ? `<li class="muted">...${c.files.length - 8} more</li>` : "";

      return card(`
        <div class="card-header">
          <a href="${c.url}" target="_blank" class="mono">${c.sha.slice(0, 7)}</a>
          <span class="card-title">${esc(c.message)}</span>
          <span class="muted" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
        </div>
        ${files.length ? `<ul class="file-list">${fileList}${more}</ul>` : ""}`);
    }).join("");

    return `<div style="margin-bottom:24px">
      <div style="margin-bottom:8px">${repoTag} <a href="${first?.url?.split("/commit/")[0] || "#"}" target="_blank" class="muted" style="font-size:0.85em">${repoKey}</a></div>
      ${rows}
    </div>`;
  }).join("");
}

// ---- Hotfix section ----
function buildHotfixSection(data) {
  if (!data) return "<p class='muted'>No data yet.</p>";
  const posts = (data.posts || []).slice(0, 25);
  if (!posts.length) return "<p class='muted'>No posts found.</p>";

  return posts.map((p) => {
    const sourceTag = p.source === "blizzard-news" ? badge("Blizzard News", "blue") : badge("Forums", "grey");
    const pinnedTag = p.pinned ? badge("pinned", "purple") : "";
    const desc = p.description ? `<div style="padding:4px 14px 10px;font-size:0.84em;color:#8b949e">${esc(p.description)}...</div>` : "";
    return card(`
      <div class="card-header">
        ${sourceTag}${pinnedTag}
        <a href="${p.url}" target="_blank">${esc(p.title)}</a>
        <span class="muted" title="${formatDate(p.date)}">${timeAgo(p.date)}</span>
        ${p.replyCount ? `<span class="muted">${p.replyCount} replies</span>` : ""}
      </div>${desc}`);
  }).join("");
}

// ---- Spell flags section ----
function buildSpellSection(data) {
  if (!data) return "<p class='muted'>No data yet.</p>";
  const changes = (data.changes || []).slice(0, 30);
  const spells = data.spells || {};
  let html = "";

  if (changes.length) {
    html += "<h3>Flag Changes</h3>";
    html += changes.map((c) => {
      const privateTag = c.privateAuraChanged ? badge("PRIVATE AURA", "red") : "";
      const added = (c.added || []).map((f) => `<li>${badge("added", "green")} <code>${esc(f)}</code></li>`).join("");
      const removed = (c.removed || []).map((f) => `<li>${badge("removed", "red")} <code>${esc(f)}</code></li>`).join("");
      return card(`
        <div class="card-header">
          ${privateTag}
          <strong>${esc(c.name)}</strong> <span class="muted">(ID: ${c.id})</span>
          <span class="muted" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
        </div>
        <ul class="file-list">${added}${removed}</ul>`, c.privateAuraChanged);
    }).join("");
  } else {
    html += `<p class="muted" style="margin-bottom:16px">No changes detected yet. Baseline will be set on first run, changes shown on subsequent runs.</p>`;
  }

  if (Object.keys(spells).length) {
    html += "<h3>Watched Spells</h3>";
    html += `<table><thead><tr><th>ID</th><th>Name</th><th>Active Flags</th><th>Last Checked</th></tr></thead><tbody>`;
    for (const [id, spell] of Object.entries(spells)) {
      const flags = (spell.flags || []).map((f) => {
        const isPrivate = f === "SPELL_ATTR8_AURA_IS_PRIVATE";
        return `<code class="${isPrivate ? "flag-private" : ""}">${esc(f)}</code>`;
      }).join(" ") || `<span class="muted">none</span>`;
      html += `<tr><td>${id}</td><td>${esc(spell.name)}</td><td>${flags}</td><td class="muted">${timeAgo(data.lastChecked)}</td></tr>`;
    }
    html += "</tbody></table>";
  }

  return html;
}

// ---- Builds section ----
function buildBuildsSection(data) {
  if (!data) return "<p class='muted'>No data yet.</p>";
  const builds = (data.builds || []).slice(0, 20);
  if (!builds.length) return "<p class='muted'>No build data returned.</p>";

  let html = `<table><thead><tr><th>Version</th><th>Product</th><th>Date</th></tr></thead><tbody>`;
  for (const b of builds) {
    const v = b.version || b.build || "?";
    const productLabel = b.product === "wow" ? badge("Retail", "blue") : b.product === "wowxptr" ? badge("PTR", "orange") : badge(b.product || "?", "grey");
    html += `<tr><td><code>${esc(v)}</code></td><td>${productLabel}</td><td class="muted" title="${formatDate(b.created_at)}">${timeAgo(b.created_at)}</td></tr>`;
  }
  html += "</tbody></table>";
  return html;
}

// ---- DB2 section ----
function buildDb2Section(data) {
  if (!data) return "<p class='muted'>No data yet - requires at least 2 tracked builds.</p>";
  const changes = (data.changes || []).slice(0, 30);

  let html = "";

  if (changes.length) {
    html += "<h3>Table Changes Between Builds</h3>";
    html += changes.map((c) => {
      const sample = (c.sample || []).slice(0, 2);
      const sampleHtml = sample.length
        ? `<div style="padding:4px 14px 10px;font-size:0.8em;color:#8b949e;font-family:monospace">${sample.map((s) => esc(JSON.stringify(s))).join("<br>")}</div>`
        : "";
      return card(`
        <div class="card-header">
          ${badge(c.table, "purple")}
          <span class="muted">${esc(c.reason)}</span>
          <span style="margin-left:auto">
            ${c.added ? `<span style="color:#27ae60">+${c.added}</span> ` : ""}
            ${c.removed ? `<span style="color:#c0392b">-${c.removed}</span> ` : ""}
            ${c.modified ? `<span style="color:#2471a3">~${c.modified}</span>` : ""}
          </span>
          <span class="muted">${esc(c.from)} → ${esc(c.to)}</span>
          <span class="muted" title="${formatDate(c.date)}">${timeAgo(c.date)}</span>
        </div>${sampleHtml}`);
    }).join("");
  } else {
    html += "<p class='muted'>No DB2 changes detected yet. Will populate after two consecutive builds are tracked.</p>";
  }

  if (data.lastBuild) {
    html += `<p class="muted" style="margin-top:12px">Last compared build: <code>${esc(data.lastBuild)}</code></p>`;
  }

  return html;
}

// ---- Main HTML ----
function buildHtml(uiData, hotfixData, spellData, buildData, db2Data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Blizzard API Tracker</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0d1117;color:#c9d1d9;line-height:1.6}
    a{color:#58a6ff;text-decoration:none}a:hover{text-decoration:underline}
    code,.mono{font-family:"SFMono-Regular",Consolas,monospace;font-size:0.84em;background:#161b22;padding:2px 5px;border-radius:3px}
    .muted{color:#6e7681;font-size:0.87em}

    header{background:#161b22;border-bottom:1px solid #30363d;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
    header h1{font-size:1.15rem;font-weight:600}
    header .sub{color:#6e7681;font-size:0.83em}

    nav{background:#161b22;border-bottom:1px solid #30363d;padding:0 20px;display:flex;overflow-x:auto}
    nav a{display:block;padding:10px 14px;font-size:0.88em;color:#c9d1d9;border-bottom:2px solid transparent;white-space:nowrap}
    nav a:hover{color:#58a6ff;text-decoration:none;border-bottom-color:#58a6ff}

    main{max-width:1100px;margin:0 auto;padding:20px 24px}
    section{margin-bottom:44px}
    section>h2{font-size:1.05rem;font-weight:600;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #30363d;display:flex;align-items:center;gap:8px}
    h3{font-size:0.9rem;font-weight:600;margin:18px 0 8px;color:#8b949e;text-transform:uppercase;letter-spacing:.04em}

    .card{background:#161b22;border:1px solid #30363d;border-radius:6px;margin-bottom:6px;overflow:hidden}
    .card-hl{border-color:#c0392b;box-shadow:0 0 0 1px #c0392b33}
    .card-header{padding:9px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .card-title{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .file-list{list-style:none;padding:2px 14px 10px;display:flex;flex-direction:column;gap:3px}
    .file-list li{font-size:0.83em}

    .badge{display:inline-block;padding:1px 7px;border-radius:10px;font-size:0.74em;font-weight:600;color:#fff;white-space:nowrap;flex-shrink:0}
    .flag-private{background:#3d1515!important;color:#e74c3c!important;padding:2px 6px;border-radius:3px}

    table{width:100%;border-collapse:collapse;font-size:0.87em;background:#161b22;border-radius:6px;overflow:hidden;border:1px solid #30363d}
    th{text-align:left;padding:8px 12px;background:#1c2128;border-bottom:1px solid #30363d;color:#8b949e;font-weight:500;font-size:0.83em;text-transform:uppercase;letter-spacing:.04em}
    td{padding:7px 12px;border-bottom:1px solid #21262d;vertical-align:top}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:#1c2128}

    .dash-grid{display:flex;flex-direction:column;gap:6px}
    .dash-item{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#161b22;border:1px solid #30363d;border-radius:6px;font-size:0.9em;flex-wrap:wrap}

    footer{text-align:center;padding:24px;color:#6e7681;font-size:0.81em;border-top:1px solid #21262d;margin-top:16px}
  </style>
</head>
<body>
<header>
  <div>
    <h1>Blizzard API Tracker</h1>
    <div class="sub">WoW Midnight - Builds, DB2, UI Source, M33kAuras, Spell Flags, Hotfixes</div>
  </div>
  <div class="muted">Updated: ${new Date().toUTCString()}</div>
</header>
<nav>
  <a href="#dashboard">Dashboard</a>
  <a href="#builds">Builds</a>
  <a href="#db2">DB2 Changes</a>
  <a href="#ui-source">UI Source</a>
  <a href="#hotfixes">Hotfixes</a>
  <a href="#spell-flags">Spell Flags</a>
</nav>
<main>

  <section id="dashboard">
    <h2>Recent Activity</h2>
    ${buildDashboard(uiData, hotfixData, spellData, buildData, db2Data)}
  </section>

  <section id="builds">
    <h2>Game Builds</h2>
    <p class="muted" style="margin-bottom:12px">WoW build versions from <a href="https://wago.tools/builds" target="_blank">wago.tools</a>. New builds = patches or hotfixes pushed by Blizzard.</p>
    ${buildBuildsSection(buildData)}
  </section>

  <section id="db2">
    <h2>DB2 Table Changes</h2>
    <p class="muted" style="margin-bottom:12px">Database table diffs between builds via <a href="https://wago.tools" target="_blank">wago.tools</a>. SpellMisc changes indicate spell attribute/flag updates (e.g. Private Aura additions).</p>
    ${buildDb2Section(db2Data)}
  </section>

  <section id="ui-source">
    <h2>UI Source & M33kAuras Changes</h2>
    <p class="muted" style="margin-bottom:12px">Tracks <a href="https://github.com/Gethe/wow-ui-source/tree/live" target="_blank">Gethe/wow-ui-source</a> (Lua API, FrameXML) and <a href="https://github.com/m33shoq/M33kAuras/tree/midnight" target="_blank">m33shoq/M33kAuras midnight</a> (upstream for ThisWeeksAuras).</p>
    ${buildUiSection(uiData)}
  </section>

  <section id="hotfixes">
    <h2>Hotfix Notes</h2>
    <p class="muted" style="margin-bottom:12px">Blizzard news feed and <a href="https://us.forums.blizzard.com/en/wow/c/release-notes/35" target="_blank">release notes forum</a> filtered for hotfix/patch/tuning posts.</p>
    ${buildHotfixSection(hotfixData)}
  </section>

  <section id="spell-flags">
    <h2>Spell Flag Changes</h2>
    <p class="muted" style="margin-bottom:12px">Watches ${Object.keys(spellData?.spells || {}).length || 0} spells for attribute flag changes. Private Aura flag changes directly affect addon visibility of debuffs.</p>
    ${buildSpellSection(spellData)}
  </section>

</main>
<footer>
  Sourced from <a href="https://wago.tools" target="_blank">wago.tools</a>,
  <a href="https://github.com/Gethe/wow-ui-source" target="_blank">Gethe/wow-ui-source</a>,
  <a href="https://github.com/m33shoq/M33kAuras" target="_blank">m33shoq/M33kAuras</a>,
  and <a href="https://worldofwarcraft.blizzard.com/en-us/news" target="_blank">Blizzard News</a>.
  Runs every 6 hours via GitHub Actions.
</footer>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });
  const uiData    = readJson("ui-source.json");
  const hotfixData = readJson("hotfixes.json");
  const spellData  = readJson("spell-flags.json");
  const buildData  = readJson("builds.json");
  const db2Data    = readJson("db2.json");

  fs.writeFileSync(path.join(SITE_DIR, "index.html"), buildHtml(uiData, hotfixData, spellData, buildData, db2Data));
  console.log("Site built.");
}

main();
