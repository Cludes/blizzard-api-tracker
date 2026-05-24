// Generates the GitHub Pages static site from collected data files

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const SITE_DIR = path.resolve("site");

function readJson(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function formatDate(iso) {
  if (!iso) return "Unknown";
  return new Date(iso).toUTCString();
}

function badge(text, color) {
  const colors = {
    red: "#e74c3c",
    green: "#27ae60",
    blue: "#2980b9",
    orange: "#e67e22",
    grey: "#7f8c8d",
  };
  const bg = colors[color] || colors.grey;
  return `<span class="badge" style="background:${bg}">${text}</span>`;
}

function buildUiSection(data) {
  if (!data) return "<p class='muted'>No UI source data yet.</p>";

  const changes = (data.changes || []).slice(0, 20);
  if (!changes.length) return "<p class='muted'>No changes recorded.</p>";

  return changes
    .map((c) => {
      const files = (c.files || []).slice(0, 10);
      const fileList = files
        .map((f) => {
          const statusColor =
            f.status === "added"
              ? "green"
              : f.status === "removed"
              ? "red"
              : "blue";
          return `<li>${badge(f.status, statusColor)} <code>${f.filename}</code> <span class='muted'>(+${f.additions} -${f.deletions})</span></li>`;
        })
        .join("");

      const moreTxt =
        c.files.length > 10
          ? `<li class='muted'>...and ${c.files.length - 10} more files</li>`
          : "";

      return `
      <div class="card">
        <div class="card-header">
          <a href="${c.url}" target="_blank">${c.sha.slice(0, 7)}</a>
          <span class="card-title">${c.message}</span>
          <span class="muted">${formatDate(c.date)}</span>
        </div>
        <ul class="file-list">${fileList}${moreTxt}</ul>
      </div>`;
    })
    .join("");
}

function buildHotfixSection(data) {
  if (!data) return "<p class='muted'>No hotfix data yet.</p>";

  const posts = (data.posts || []).slice(0, 15);
  if (!posts.length) return "<p class='muted'>No hotfix posts found.</p>";

  return posts
    .map(
      (p) => `
    <div class="card">
      <div class="card-header">
        <a href="${p.url}" target="_blank">${p.title}</a>
        <span class="muted">${formatDate(p.date)}</span>
      </div>
    </div>`
    )
    .join("");
}

function buildSpellSection(data) {
  if (!data) return "<p class='muted'>No spell data yet.</p>";

  const changes = (data.changes || []).slice(0, 30);
  const spells = data.spells || {};

  let html = "";

  if (changes.length) {
    html += "<h3>Recent Flag Changes</h3>";
    html += changes
      .map((c) => {
        const name = c.spell?.name || `Spell ${c.spell?.id}`;
        const privateTag = c.privateAuraChanged
          ? badge("PRIVATE AURA", "red")
          : "";
        const added = (c.added || [])
          .map((f) => `<li>${badge("added", "green")} <code>${f}</code></li>`)
          .join("");
        const removed = (c.removed || [])
          .map((f) => `<li>${badge("removed", "red")} <code>${f}</code></li>`)
          .join("");

        return `
        <div class="card ${c.privateAuraChanged ? "card-highlight" : ""}">
          <div class="card-header">
            ${privateTag}
            <strong>${name}</strong> (ID: ${c.spell?.id})
            <span class="muted">${formatDate(c.date)}</span>
          </div>
          <ul class="file-list">${added}${removed}</ul>
        </div>`;
      })
      .join("");
  }

  html += "<h3>Watched Spells</h3>";
  html += "<table><thead><tr><th>ID</th><th>Name</th><th>Flags</th><th>Last Checked</th></tr></thead><tbody>";
  for (const [id, spell] of Object.entries(spells)) {
    const flags = (spell.flags || [])
      .map((f) => {
        const isPrivate = f === "SPELL_ATTR8_AURA_IS_PRIVATE";
        return `<code class="${isPrivate ? "flag-private" : ""}">${f}</code>`;
      })
      .join(" ");
    html += `<tr><td>${id}</td><td>${spell.name}</td><td>${flags || "<span class='muted'>none</span>"}</td><td class="muted">${formatDate(data.lastChecked)}</td></tr>`;
  }
  html += "</tbody></table>";

  return html;
}

function buildHtml(uiData, hotfixData, spellData) {
  const lastChecked = new Date().toUTCString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blizzard API Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { font-family: "SFMono-Regular", Consolas, monospace; font-size: 0.85em; background: #161b22; padding: 2px 5px; border-radius: 3px; }
    .muted { color: #6e7681; font-size: 0.88em; }

    header { background: #161b22; border-bottom: 1px solid #30363d; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 1.2rem; font-weight: 600; }
    header .subtitle { color: #6e7681; font-size: 0.85em; }

    nav { background: #161b22; border-bottom: 1px solid #30363d; padding: 0 24px; display: flex; gap: 0; }
    nav a { display: block; padding: 12px 16px; font-size: 0.9em; color: #c9d1d9; border-bottom: 2px solid transparent; }
    nav a:hover { color: #58a6ff; text-decoration: none; border-bottom-color: #58a6ff; }

    main { max-width: 1100px; margin: 0 auto; padding: 24px; }
    section { margin-bottom: 40px; }
    section h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #30363d; }
    section h3 { font-size: 0.95rem; font-weight: 600; margin: 16px 0 8px; color: #8b949e; }

    .card { background: #161b22; border: 1px solid #30363d; border-radius: 6px; margin-bottom: 8px; overflow: hidden; }
    .card-highlight { border-color: #e74c3c; }
    .card-header { padding: 10px 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .card-title { font-weight: 500; flex: 1; }
    .file-list { list-style: none; padding: 0 14px 10px; display: flex; flex-direction: column; gap: 3px; }
    .file-list li { font-size: 0.85em; }

    .badge { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 0.75em; font-weight: 600; color: #fff; white-space: nowrap; }
    .flag-private { background: #3d1515; color: #e74c3c; }

    table { width: 100%; border-collapse: collapse; font-size: 0.88em; }
    th { text-align: left; padding: 8px 12px; background: #161b22; border-bottom: 1px solid #30363d; color: #8b949e; font-weight: 500; }
    td { padding: 8px 12px; border-bottom: 1px solid #21262d; vertical-align: top; }
    tr:last-child td { border-bottom: none; }

    footer { text-align: center; padding: 24px; color: #6e7681; font-size: 0.82em; border-top: 1px solid #21262d; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Blizzard API Tracker</h1>
      <div class="subtitle">WoW Midnight - Lua API, Spell Flags, UI Source, Hotfixes</div>
    </div>
    <div class="muted">Last updated: ${lastChecked}</div>
  </header>

  <nav>
    <a href="#ui-source">UI Source</a>
    <a href="#hotfixes">Hotfixes</a>
    <a href="#spell-flags">Spell Flags</a>
  </nav>

  <main>
    <section id="ui-source">
      <h2>WoW UI Source Changes</h2>
      <p class="muted" style="margin-bottom:12px">Tracking <a href="https://github.com/Gethe/wow-ui-source/tree/live" target="_blank">Gethe/wow-ui-source (live branch)</a> - FrameXML, Lua API, built-in UI files.</p>
      ${buildUiSection(uiData)}
    </section>

    <section id="hotfixes">
      <h2>Hotfix Notes</h2>
      <p class="muted" style="margin-bottom:12px">Latest hotfix posts from the <a href="https://us.forums.blizzard.com/en/wow/c/release-notes/35" target="_blank">Blizzard WoW forums</a>.</p>
      ${buildHotfixSection(hotfixData)}
    </section>

    <section id="spell-flags">
      <h2>Spell Flag Changes</h2>
      <p class="muted" style="margin-bottom:12px">Monitored spells from the <a href="../data/spell-watchlist.json" target="_blank">watchlist</a>. Highlights Private Aura flag changes.</p>
      ${buildSpellSection(spellData)}
    </section>
  </main>

  <footer>
    Data sourced from <a href="https://github.com/Gethe/wow-ui-source" target="_blank">Gethe/wow-ui-source</a>,
    <a href="https://wago.tools" target="_blank">wago.tools</a>, and
    <a href="https://us.forums.blizzard.com/en/wow" target="_blank">Blizzard Forums</a>.
    Updated every 6 hours via GitHub Actions.
  </footer>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });

  const uiData = readJson("ui-source.json");
  const hotfixData = readJson("hotfixes.json");
  const spellData = readJson("spell-flags.json");

  const html = buildHtml(uiData, hotfixData, spellData);
  fs.writeFileSync(path.join(SITE_DIR, "index.html"), html);
  console.log("Site built successfully.");
}

main();
