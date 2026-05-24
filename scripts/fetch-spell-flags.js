// Fetches spell data for a watchlist of spells from the wago.tools API
// Tracks flag changes (e.g. SPELL_ATTR8_AURA_IS_PRIVATE) between runs

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const WATCHLIST_FILE = path.resolve("data/spell-watchlist.json");
const OUT_FILE = path.resolve("data/spell-flags.json");

// wago.tools spell lookup API
const WAGO_SPELL_URL = (id) =>
  `https://wago.tools/api/spell/${id}?locale=en_US`;

// Blizzard Game Data API - spell data (requires OAuth, optional)
const BNET_SPELL_URL = (id) =>
  `https://us.api.blizzard.com/data/wow/spell/${id}?namespace=static-us&locale=en_US`;

const PRIVATE_AURA_FLAG = "SPELL_ATTR8_AURA_IS_PRIVATE";

async function fetchSpellFromWago(id) {
  try {
    const res = await fetch(WAGO_SPELL_URL(id), {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id,
      name: data.name || `Spell ${id}`,
      flags: data.attributes || [],
      schoolMask: data.schoolMask || null,
      raw: data,
    };
  } catch {
    return null;
  }
}

async function fetchSpellFromBnet(id, token) {
  try {
    const res = await fetch(BNET_SPELL_URL(id), {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "blizzard-api-tracker/1.0",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id,
      name: data.name?.en_US || `Spell ${id}`,
      flags: [],
      raw: data,
    };
  } catch {
    return null;
  }
}

function diffSpell(prev, curr) {
  if (!prev) return { type: "new", spell: curr };
  const prevFlags = new Set(prev.flags);
  const currFlags = new Set(curr.flags);

  const added = curr.flags.filter((f) => !prevFlags.has(f));
  const removed = prev.flags.filter((f) => !currFlags.has(f));

  if (added.length === 0 && removed.length === 0) return null;

  return {
    type: "changed",
    spell: curr,
    added,
    removed,
    privateAuraChanged:
      added.includes(PRIVATE_AURA_FLAG) || removed.includes(PRIVATE_AURA_FLAG),
  };
}

async function main() {
  if (!fs.existsSync(WATCHLIST_FILE)) {
    console.log("No spell watchlist found at data/spell-watchlist.json");
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
    console.log(`Fetching spell ${spell.id} (${spell.name || "unknown"})...`);
    const data = await fetchSpellFromWago(spell.id);
    if (!data) {
      console.warn(`  Could not fetch spell ${spell.id}`);
      continue;
    }
    currentSpells[spell.id] = data;

    const diff = diffSpell(existing.spells[spell.id] || null, data);
    if (diff) {
      newChanges.push({
        ...diff,
        date: new Date().toISOString(),
      });
      const tag = diff.privateAuraChanged ? " [PRIVATE AURA CHANGED]" : "";
      console.log(`  Change detected for ${data.name}${tag}`);
      if (diff.added?.length) console.log(`    Added flags: ${diff.added.join(", ")}`);
      if (diff.removed?.length) console.log(`    Removed flags: ${diff.removed.join(", ")}`);
    }
  }

  const output = {
    lastChecked: new Date().toISOString(),
    spells: { ...existing.spells, ...currentSpells },
    changes: [...newChanges, ...(existing.changes || [])].slice(0, 100),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `Spell flags: checked ${watchlist.spells.length} spell(s), ${newChanges.length} change(s) detected.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
