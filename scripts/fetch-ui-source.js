// Tracks changes to WoW's Lua API and FrameXML UI source via Gethe/wow-ui-source
// Compares the latest commit SHA against what we last recorded and writes a diff summary

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const REPO = "Gethe/wow-ui-source";
const BRANCH = "live";
const OUT_FILE = path.resolve("data/ui-source.json");

async function getLatestCommit() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits/${BRANCH}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

async function getCommitsSince(sha) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&since=${new Date(0).toISOString()}&per_page=20`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const commits = await res.json();
  // Return commits newer than the known SHA
  const idx = commits.findIndex((c) => c.sha === sha);
  return idx === -1 ? commits : commits.slice(0, idx);
}

async function getCommitFiles(sha) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits/${sha}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return (data.files || []).map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    patch: f.patch || null,
  }));
}

async function main() {
  let existing = { sha: null, changes: [] };
  if (fs.existsSync(OUT_FILE)) {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  }

  const latest = await getLatestCommit();
  const latestSha = latest.sha;

  if (latestSha === existing.sha) {
    console.log("UI source: no changes since last run.");
    return;
  }

  const newCommits = existing.sha
    ? await getCommitsSince(existing.sha)
    : [latest];

  const changes = [];
  for (const commit of newCommits) {
    const files = await getCommitFiles(commit.sha);
    changes.push({
      sha: commit.sha,
      date: commit.commit.author.date,
      message: commit.commit.message.split("\n")[0],
      url: commit.html_url,
      files,
    });
  }

  const output = {
    sha: latestSha,
    lastChecked: new Date().toISOString(),
    changes: [...changes, ...(existing.changes || [])].slice(0, 50),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`UI source: recorded ${changes.length} new commit(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
