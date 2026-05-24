import fs from "fs";
import path from "path";
import { getStyles } from "./site/styles.js";
import {
  esc,
  buildHeader,
  buildNav,
  buildDashboard,
  buildBuildsSection,
  buildDb2Section,
  buildUiSection,
  buildHotfixSection,
  buildSpellSection,
  buildFooter,
} from "./site/components.js";

const DATA_DIR = path.resolve("data");
const SITE_DIR = path.resolve("site");

function readJson(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

const INLINE_JS = `
<script>(function(){
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function() {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  var sections = document.querySelectorAll('.section[id]');
  var navLinks = nav.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length || !window.IntersectionObserver) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function(l) { l.classList.remove('active'); });
      var active = nav.querySelector('.nav-link[href="#' + entry.target.id + '"]');
      if (active) active.classList.add('active');
    });
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
  sections.forEach(function(s) { observer.observe(s); });
})();</script>`;

function buildHtml(uiData, hotfixData, spellData, buildData, db2Data) {
  const lastUpdated = new Date().toUTCString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="description" content="Live tracker for Blizzard WoW API changes: builds, DB2 tables, UI source, spell flags, and hotfix notes."/>
  <title>Blizzard API Tracker</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>${getStyles()}</style>
</head>
<body>
<div class="page-wrapper">
  ${buildHeader(lastUpdated)}
  ${buildNav()}
  <main class="main-content" id="main-content">
    ${buildDashboard(uiData, hotfixData, spellData, buildData, db2Data)}
    ${buildBuildsSection(buildData)}
    ${buildDb2Section(db2Data)}
    ${buildUiSection(uiData)}
    ${buildHotfixSection(hotfixData)}
    ${buildSpellSection(spellData)}
  </main>
  ${buildFooter()}
</div>
${INLINE_JS}
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(SITE_DIR)) fs.mkdirSync(SITE_DIR, { recursive: true });
  const uiData     = readJson("ui-source.json");
  const hotfixData = readJson("hotfixes.json");
  const spellData  = readJson("spell-flags.json");
  const buildData  = readJson("builds.json");
  const db2Data    = readJson("db2.json");
  fs.writeFileSync(path.join(SITE_DIR, "index.html"), buildHtml(uiData, hotfixData, spellData, buildData, db2Data));
  console.log("Site built.");
}

main();
