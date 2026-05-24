// Tracks DB2 table changes between WoW builds via wago.tools
// Focuses on tables relevant to addon authors: SpellMisc, SpellAuraOptions,
// SpellEffect, SpellName, ChrSpecialization, etc.

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/db2.json");
const BUILDS_FILE = path.resolve("data/builds.json");

// Tables most relevant to addon authors
const WATCHED_TABLES = [
  { name: "SpellMisc",         reason: "Spell attributes incl. Private Aura flag" },
  { name: "SpellAuraOptions",  reason: "Aura stacking, proc rates" },
  { name: "SpellEffect",       reason: "Spell effect types and values" },
  { name: "SpellName",         reason: "Spell name strings" },
  { name: "SpellCooldowns",    reason: "Spell cooldown data" },
  { name: "SpellInterrupts",   reason: "Interrupt/lockout data" },
  { name: "SpellCategories",   reason: "Spell category groupings" },
  { name: "ChrSpecialization", reason: "Spec IDs and class associations" },
  { name: "Difficulty",        reason: "Instance difficulty definitions" },
  { name: "Map",               reason: "Zone/instance map data" },
];

// wago.tools DB2 API - get row count and checksum for a table at a given build
function wagoTableUrl(table, build) {
  return `https://wago.tools/api/data/${table}?build=${build}&locale=enUS&start=0&end=1`;
}

// wago.tools table diff between two builds
function wagoTableDiffUrl(table, from, to) {
  return `https://wago.tools/api/data/${table}/diff?from=${from}&to=${to}`;
}

async function fetchTableMeta(table, build) {
  try {
    const res = await fetch(wagoTableUrl(table, build), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      total: data?.count ?? data?.total ?? null,
      build,
    };
  } catch {
    return null;
  }
}

async function fetchTableDiff(table, from, to) {
  try {
    const res = await fetch(wagoTableDiffUrl(table, from, to), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const added = data?.added?.length ?? 0;
    const removed = data?.removed?.length ?? 0;
    const modified = data?.modified?.length ?? 0;
    if (added + removed + modified === 0) return null;
    return { added, removed, modified, sample: data?.modified?.slice(0, 3) || [] };
  } catch {
    return null;
  }
}

async function main() {
  // Read current builds to know what to compare
  if (!fs.existsSync(BUILDS_FILE)) {
    console.log("DB2: no builds data yet, skipping.");
    return;
  }

  const buildsData = JSON.parse(fs.readFileSync(BUILDS_FILE, "utf8"));
  const wowBuilds = (buildsData.builds || [])
    .filter((b) => b.product === "wow")
    .slice(0, 5);

  if (wowBuilds.length < 2) {
    console.log("DB2: need at least 2 builds to diff, skipping.");
    return;
  }

  let existing = { lastChecked: null, tables: {}, changes: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const latestBuild = wowBuilds[0].version || wowBuilds[0].build;
  const previousBuild = wowBuilds[1].version || wowBuilds[1].build;
  const lastKnownBuild = existing.lastBuild;

  if (latestBuild === lastKnownBuild) {
    console.log(`DB2: no new build since last check (${latestBuild}), skipping.`);
    return;
  }

  console.log(`DB2: comparing ${previousBuild} -> ${latestBuild}`);

  const newChanges = [];
  const tableState = { ...existing.tables };

  for (const table of WATCHED_TABLES) {
    console.log(`  Checking ${table.name}...`);
    const diff = await fetchTableDiff(table.name, previousBuild, latestBuild);
    if (diff) {
      const change = {
        table: table.name,
        reason: table.reason,
        from: previousBuild,
        to: latestBuild,
        date: new Date().toISOString(),
        ...diff,
      };
      newChanges.push(change);
      console.log(`    Changed: +${diff.added} -${diff.removed} ~${diff.modified}`);
    }
    tableState[table.name] = { lastChecked: new Date().toISOString(), latestBuild };
  }

  const output = {
    lastChecked: new Date().toISOString(),
    lastBuild: latestBuild,
    tables: tableState,
    changes: [...newChanges, ...(existing.changes || [])].slice(0, 100),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`DB2: ${newChanges.length} table(s) changed between ${previousBuild} and ${latestBuild}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
