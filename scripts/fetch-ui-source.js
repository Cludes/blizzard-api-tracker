// Tracks changes to WoW Lua API and FrameXML via multiple repos:
// - Gethe/wow-ui-source (live branch) - official WoW UI source mirror
// - m33shoq/M33kAuras (midnight branch) - upstream for ThisWeeksAuras

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const OUT_FILE = path.resolve("data/ui-source.json");

const REPOS = [
  {
    key: "wow-ui-source",
    repo: "Gethe/wow-ui-source",
    branch: "live",
    label: "WoW UI Source (live)",
    url: "https://github.com/Gethe/wow-ui-source/tree/live",
  },
  {
    key: "m33kauras-midnight",
    repo: "m33shoq/M33kAuras",
    branch: "midnight",
    label: "M33kAuras (midnight)",
    url: "https://github.com/m33shoq/M33kAuras/tree/midnight",
  },
];

function ghHeaders() {
  return {
    Accept: "application/vnd.github.v3+json",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

async function ghFetch(url) {
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  return res.json();
}

async function getRecentCommits(repo, branch, perPage = 30) {
  return ghFetch(
    `https://api.github.com/repos/${repo}/commits?sha=${branch}&per_page=${perPage}`
  );
}

async function getCommitFiles(repo, sha) {
  const data = await ghFetch(
    `https://api.github.com/repos/${repo}/commits/${sha}`
  );
  return (data.files || []).map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    patch: f.patch ? f.patch.slice(0, 2000) : null,
  }));
}

async function processRepo(repoConfig, existingSha) {
  const commits = await getRecentCommits(repoConfig.repo, repoConfig.branch, 50);
  if (!commits.length) return { sha: existingSha, changes: [] };

  const latestSha = commits[0].sha;
  if (latestSha === existingSha) return { sha: existingSha, changes: [] };

  const newCommits = existingSha
    ? commits.slice(0, commits.findIndex((c) => c.sha === existingSha)).filter((_, i) => i < 30)
    : commits.slice(0, 30);

  const changes = [];
  for (const commit of newCommits) {
    // Rate limit: fetch files for max 10 commits
    const files = changes.length < 10 ? await getCommitFiles(repoConfig.repo, commit.sha) : [];
    changes.push({
      sha: commit.sha,
      date: commit.commit.author.date,
      message: commit.commit.message.split("\n")[0],
      url: commit.html_url,
      repo: repoConfig.key,
      repoLabel: repoConfig.label,
      files,
    });
  }

  return { sha: latestSha, changes };
}

async function main() {
  let existing = {};
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const allNewChanges = [];
  const newShas = {};

  for (const repoConfig of REPOS) {
    console.log(`Checking ${repoConfig.label}...`);
    try {
      const existingSha = existing[repoConfig.key]?.sha || null;
      const { sha, changes } = await processRepo(repoConfig, existingSha);
      newShas[repoConfig.key] = { sha, label: repoConfig.label, url: repoConfig.url };
      allNewChanges.push(...changes);
      console.log(`  ${repoConfig.key}: ${changes.length} new commit(s)`);
    } catch (e) {
      console.warn(`  Failed: ${e.message}`);
      if (existing[repoConfig.key]) newShas[repoConfig.key] = existing[repoConfig.key];
    }
  }

  // Merge with existing, keep last 100 changes
  const existingChanges = existing.changes || [];
  const newShaSet = new Set(allNewChanges.map((c) => c.sha));
  const merged = [
    ...allNewChanges,
    ...existingChanges.filter((c) => !newShaSet.has(c.sha)),
  ].slice(0, 100);

  const output = {
    ...newShas,
    lastChecked: new Date().toISOString(),
    changes: merged,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`UI source: ${allNewChanges.length} total new commit(s) across all repos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
