# Blizzard API Tracker

Tracks changes to Blizzard's World of Warcraft data and API surface over time: the Lua API, spell flags, DB2 game data, the extracted UI source, and hotfix notes. A scheduled job fetches the latest data each build and the results are published as a static site.

## How it works

Scripts under [`scripts/`](scripts/) each fetch one data source:

- `fetch-builds.js` - tracks WoW client builds
- `fetch-db2.js` - DB2 game data tables
- `fetch-spell-flags.js` - spell attribute flags
- `fetch-ui-source.js` - the extracted Blizzard UI Lua source
- `fetch-hotfixes.js` - hotfix notes
- `build-site.js` - renders the static site into `site/`

Fetched data is stored under [`data/`](data/) and the built site is served from [`site/`](site/).

## Running locally

```bash
npm install
node scripts/fetch-builds.js     # or any other fetch script
node scripts/build-site.js       # rebuild the static site
```
