// Fetches Blizzard WoW hotfix notes from the official news API
// Stores new entries and diffs against previously seen ones

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/hotfixes.json");

// Blizzard news API - filters for hotfix posts
const BLIZZARD_NEWS_URL =
  "https://us.battle.net/api/bnet/client/blog/list/wow?maxResults=20&offset=0&tagId=&locale=en_US";

// Fallback: Blizzard WoW community API for hotfix posts
const BLIZZARD_HOTFIX_SEARCH =
  "https://us.forums.blizzard.com/en/wow/search.json?q=hotfixes+order%3Alatest&category=release-notes";

async function fetchHotfixPosts() {
  // Try the Blizzard forums search for hotfix posts
  const res = await fetch(BLIZZARD_HOTFIX_SEARCH, {
    headers: {
      "User-Agent": "blizzard-api-tracker/1.0",
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`Blizzard forums API error: ${res.status}`);
  const data = await res.json();

  const topics = (data.topics || []).slice(0, 10).map((t) => ({
    id: String(t.id),
    title: t.title,
    date: t.created_at,
    url: `https://us.forums.blizzard.com/en/wow/t/${t.slug}/${t.id}`,
    lastPost: t.last_posted_at,
  }));

  return topics;
}

async function main() {
  let existing = { lastChecked: null, posts: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const posts = await fetchHotfixPosts();
  const existingIds = new Set((existing.posts || []).map((p) => p.id));
  const newPosts = posts.filter((p) => !existingIds.has(p.id));

  const output = {
    lastChecked: new Date().toISOString(),
    posts: [...posts],
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));

  if (newPosts.length > 0) {
    console.log(`Hotfixes: found ${newPosts.length} new post(s).`);
  } else {
    console.log("Hotfixes: no new posts.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
