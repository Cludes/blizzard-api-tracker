// Tracks WoW game builds and patch notes via wago.tools builds API
// This is where hotfix-level game data changes (like Private Aura flag changes) are detected

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/builds.json");

// wago.tools build list API - returns object keyed by product
const WAGO_BUILDS_URL = "https://wago.tools/api/builds";

// wago.tools changelog between two builds
function wagoBuildDiffUrl(from, to) {
  return `https://wago.tools/api/diff?from=${from}&to=${to}&product=wow`;
}

async function fetchBuilds() {
  const res = await fetch(WAGO_BUILDS_URL, {
    headers: { "User-Agent": "blizzard-api-tracker/1.0" },
  });
  if (!res.ok) throw new Error(`wago.tools builds API error: ${res.status}`);
  return res.json();
}

async function fetchBuildDiff(from, to) {
  try {
    const res = await fetch(wagoBuildDiffUrl(from, to), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function main() {
  let existing = { lastChecked: null, latestBuild: null, builds: [], diffs: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const data = await fetchBuilds();
  // API returns object keyed by product: { "wow": [...], "wowxptr": [...], ... }
  // Extract retail WoW builds and PTR builds
  const wowBuilds = Array.isArray(data) ? data : (data?.wow || []);
  const ptrBuilds = data?.wowxptr || [];
  const builds = [...wowBuilds, ...ptrBuilds].sort((a, b) =>
    new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  if (!builds.length) {
    console.log("Builds: no WoW build data returned from wago.tools.");
    fs.writeFileSync(OUT_FILE, JSON.stringify({ lastChecked: new Date().toISOString(), raw: data, builds: [], diffs: [] }, null, 2));
    return;
  }

  const latestBuild = builds[0];
  const latestVersion = latestBuild.version || latestBuild.buildText || latestBuild.build;
  const newBuilds = existing.latestBuild
    ? builds.filter((b) => {
        const v = b.version || b.buildText || b.build;
        return v !== existing.latestBuild;
      })
    : builds.slice(0, 5);

  const newDiffs = [];
  if (newBuilds.length && existing.latestBuild) {
    const diff = await fetchBuildDiff(existing.latestBuild, latestVersion);
    if (diff) {
      newDiffs.push({
        from: existing.latestBuild,
        to: latestVersion,
        date: new Date().toISOString(),
        diff,
      });
    }
  }

  const output = {
    lastChecked: new Date().toISOString(),
    latestBuild: latestVersion,
    builds: builds.slice(0, 20),
    diffs: [...newDiffs, ...(existing.diffs || [])].slice(0, 20),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `Builds: latest=${latestVersion}, ${newBuilds.length} new build(s), ${newDiffs.length} diff(s).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
