// Fetches official Blizzard WoW hotfix/release notes posts via Discourse API

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/hotfixes.json");

// Blizzard forums Discourse API - release-notes category
const RELEASE_NOTES_URL =
  "https://us.forums.blizzard.com/en/wow/c/release-notes/35.json?order=created";

async function fetchRelaseNotes() {
  const res = await fetch(RELEASE_NOTES_URL, {
    headers: {
      "User-Agent": "blizzard-api-tracker/1.0",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Blizzard forums API error: ${res.status}`);
  const data = await res.json();

  return (data.topic_list?.topics || []).map((t) => ({
    id: String(t.id),
    title: t.title,
    date: t.created_at,
    lastActivity: t.last_posted_at,
    url: `https://us.forums.blizzard.com/en/wow/t/${t.slug}/${t.id}`,
    pinned: t.pinned || false,
    replyCount: t.reply_count || 0,
  }));
}

async function main() {
  let existing = { lastChecked: null, posts: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const posts = await fetchRelaseNotes();
  const existingIds = new Set((existing.posts || []).map((p) => p.id));
  const newPosts = posts.filter((p) => !existingIds.has(p.id));

  const output = {
    lastChecked: new Date().toISOString(),
    posts,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `Hotfixes: ${newPosts.length} new post(s), ${posts.length} total.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
