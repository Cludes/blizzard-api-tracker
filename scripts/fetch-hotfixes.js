// Fetches official Blizzard WoW hotfix and patch notes
// Sources: Blizzard news RSS + WoW forums hotfix threads (staff-only filter)

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/hotfixes.json");

// Blizzard WoW news RSS feed
const BNET_NEWS_RSS = "https://worldofwarcraft.blizzard.com/en-us/news/rss";

// WoW forums - hotfix posts specifically (staff posts in release-notes)
// Filter topics by Blizzard staff poster
const FORUMS_HOTFIX_URL =
  "https://us.forums.blizzard.com/en/wow/search.json?q=hotfixes%20%40blizzard%20order%3Alatest&in=title";

// WoW forums release notes category - filter for staff posts
const RELEASE_NOTES_URL =
  "https://us.forums.blizzard.com/en/wow/c/release-notes/35.json?order=created";

function parseRssItem(item) {
  const getTag = (tag) => {
    const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, "$1").trim() : "";
  };
  return {
    id: getTag("guid") || getTag("link"),
    title: getTag("title"),
    date: getTag("pubDate"),
    url: getTag("link"),
    description: getTag("description").replace(/<[^>]+>/g, "").slice(0, 200),
    source: "blizzard-news",
  };
}

async function fetchBlizzardNews() {
  try {
    const res = await fetch(BNET_NEWS_RSS, {
      headers: { "User-Agent": "blizzard-api-tracker/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Extract items from RSS
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    return items.slice(0, 20).map(parseRssItem).filter((i) => i.title);
  } catch (e) {
    console.warn("Failed to fetch Blizzard news RSS:", e.message);
    return [];
  }
}

async function fetchForumHotfixes() {
  try {
    const res = await fetch(RELEASE_NOTES_URL, {
      headers: {
        "User-Agent": "blizzard-api-tracker/1.0",
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();

    // Filter for pinned topics or topics with "hotfix" in the title (official Blizzard posts)
    const topics = (data.topic_list?.topics || [])
      .filter(
        (t) =>
          t.pinned ||
          t.pinned_globally ||
          t.title.toLowerCase().includes("hotfix") ||
          t.title.toLowerCase().includes("patch notes") ||
          t.title.toLowerCase().includes("class tuning")
      )
      .slice(0, 15)
      .map((t) => ({
        id: `forum-${t.id}`,
        title: t.title,
        date: t.created_at,
        lastActivity: t.last_posted_at,
        url: `https://us.forums.blizzard.com/en/wow/t/${t.slug}/${t.id}`,
        pinned: t.pinned || t.pinned_globally || false,
        replyCount: t.reply_count || 0,
        source: "blizzard-forums",
      }));

    return topics;
  } catch (e) {
    console.warn("Failed to fetch forum hotfixes:", e.message);
    return [];
  }
}

async function main() {
  let existing = { lastChecked: null, posts: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const [newsItems, forumItems] = await Promise.all([
    fetchBlizzardNews(),
    fetchForumHotfixes(),
  ]);

  // Merge both sources, deduplicate by id
  const allPosts = [...newsItems, ...forumItems];
  const seen = new Set();
  const posts = allPosts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const existingIds = new Set((existing.posts || []).map((p) => p.id));
  const newPosts = posts.filter((p) => !existingIds.has(p.id));

  const output = {
    lastChecked: new Date().toISOString(),
    posts,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `Hotfixes: ${newPosts.length} new item(s), ${posts.length} total from ${newsItems.length} news + ${forumItems.length} forum posts.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
