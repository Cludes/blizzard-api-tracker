// Fetches spell attribute data from wago.tools DB2 API
// Tracks flag changes (e.g. SPELL_ATTR8_AURA_IS_PRIVATE) between runs

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const WATCHLIST_FILE = path.resolve("data/spell-watchlist.json");
const OUT_FILE = path.resolve("data/spell-flags.json");

const PRIVATE_AURA_ATTR = "SPELL_ATTR8_AURA_IS_PRIVATE";

// wago.tools DB2 API - SpellMisc contains attribute flags
// Attributes0..Attributes9 are the flag fields
function wagoSpellMiscUrl(spellId) {
  return `https://wago.tools/api/casc/SpellMisc?SpellID=${spellId}`;
}

// wago.tools spell search API for name/basic info
function wagoSpellInfoUrl(spellId) {
  return `https://wago.tools/api/spell?id=${spellId}&locale=enUS`;
}

// Attribute bit positions for SPELL_ATTR8_AURA_IS_PRIVATE = attr8, bit 26
const ATTR_DEFS = {
  SPELL_ATTR8_AURA_IS_PRIVATE: { field: "Attributes8", bit: 26 },
  // Add more flag definitions here as needed
};

function checkFlag(row, flagName) {
  const def = ATTR_DEFS[flagName];
  if (!def) return false;
  const val = parseInt(row[def.field] || "0", 10);
  return (val & (1 << def.bit)) !== 0;
}

async function fetchSpellMisc(spellId) {
  try {
    const res = await fetch(wagoSpellMiscUrl(spellId), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Returns array of rows - take the latest (highest ID)
    const rows = Array.isArray(data) ? data : data?.rows || [];
    if (!rows.length) return null;
    return rows[rows.length - 1];
  } catch {
    return null;
  }
}

async function fetchSpellName(spellId) {
  try {
    const res = await fetch(wagoSpellInfoUrl(spellId), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.name || null;
  } catch {
    return null;
  }
}

function getActiveFlags(row) {
  const active = [];
  for (const [flagName] of Object.entries(ATTR_DEFS)) {
    if (checkFlag(row, flagName)) active.push(flagName);
  }
  return active;
}

function diffSpell(prev, curr) {
  if (!prev) return curr.flags.length > 0 ? { type: "new", ...curr } : null;

  const prevSet = new Set(prev.flags);
  const currSet = new Set(curr.flags);
  const added = curr.flags.filter((f) => !prevSet.has(f));
  const removed = prev.flags.filter((f) => !currSet.has(f));

  if (!added.length && !removed.length) return null;
  return {
    type: "changed",
    id: curr.id,
    name: curr.name,
    added,
    removed,
    privateAuraChanged:
      added.includes(PRIVATE_AURA_ATTR) || removed.includes(PRIVATE_AURA_ATTR),
  };
}

async function main() {
  if (!fs.existsSync(WATCHLIST_FILE)) {
    console.log("No spell watchlist found.");
    process.exit(0);
  }

  const watchlist = JSON.parse(fs.readFileSync(WATCHLIST_FILE, "utf8"));
  let existing = { lastChecked: null, spells: {}, changes: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const currentSpells = {};
  const newChanges = [];

  for (const spell of watchlist.spells) {
    console.log(`Fetching spell ${spell.id} (${spell.name})...`);

    const row = await fetchSpellMisc(spell.id);
    if (!row) {
      console.warn(`  No SpellMisc data for ${spell.id}`);
      continue;
    }

    const flags = getActiveFlags(row);
    const name = spell.name;

    const curr = { id: spell.id, name, flags, raw: row };
    currentSpells[spell.id] = curr;

    const diff = diffSpell(existing.spells[spell.id] || null, curr);
    if (diff) {
      newChanges.push({ ...diff, date: new Date().toISOString() });
      const tag = diff.privateAuraChanged ? " [PRIVATE AURA CHANGED]" : "";
      console.log(`  Change detected: ${name}${tag}`);
      if (diff.added?.length) console.log(`    + ${diff.added.join(", ")}`);
      if (diff.removed?.length) console.log(`    - ${diff.removed.join(", ")}`);
    } else {
      console.log(`  No changes. Active flags: ${flags.join(", ") || "none"}`);
    }
  }

  const output = {
    lastChecked: new Date().toISOString(),
    spells: { ...existing.spells, ...currentSpells },
    changes: [...newChanges, ...(existing.changes || [])].slice(0, 100),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `Spell flags: ${watchlist.spells.length} checked, ${newChanges.length} change(s).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
