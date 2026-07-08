# Scripts

## GoLive checks

Production-oriented checks for local, staging, and live URLs.

```bash
npm run golive:check
npm run golive:smoke
npm run golive:load
```

Configuration:

- `GOLIVE_BASE_URL`: target URL, default `http://localhost:3000`
- `GOLIVE_PATHS`: comma-separated paths, default `/,/healthz,/manifest.webmanifest,/offline,/cart,/search`
- `GOLIVE_TIMEOUT_MS`: request timeout, default `10000`
- `GOLIVE_CONCURRENCY`: load-test concurrency, default `10`
- `GOLIVE_DURATION_SECONDS`: load-test duration, default `60`
- `GOLIVE_MAX_ERROR_RATE`: max 5xx/network error rate, default `0.005`
- `GOLIVE_MAX_P95_MS`: max p95 latency for load test, default `2500`
- `GOLIVE_CYPRESS=1`: include Cypress smoke in `golive:check`
- `GOLIVE_LIGHTHOUSE=1`: include Lighthouse desktop/mobile in `golive:check`

Examples:

```bash
GOLIVE_BASE_URL=https://staging.example.com npm run golive:smoke
GOLIVE_BASE_URL=https://staging.example.com GOLIVE_PATHS="/,/search,/cart,/product/example_123" npm run golive:load
GOLIVE_CYPRESS=1 GOLIVE_LIGHTHOUSE=1 npm run golive:check
```

## `spawn-worktree.sh`

Creates one or more Git worktrees under `../pwa-worktree/` (folder name = branch name with `/` replaced by `-`), then bootstraps each worktree:

- loads `nvm` and runs `nvm use` (falls back to `nvm install`)
- installs dependencies (`npm ci` if `package-lock.json` exists, otherwise `npm install`)
- runs `npm run lint` and `npm run test`

Usage:

```bash
./scripts/spawn-worktree.sh <branch> [<branch> ...] [--base <base-ref> | --head] [--worktree-jobs [<n>]]
```

Examples:

```bash
# Single worktree
npm run worktree:spawn -- feat/awesome-feature

# Multiple worktrees
npm run worktree:spawn -- feat/a feat/b feat/c

# Create worktrees in parallel (bootstrap runs in parallel, "all" when no number is provided)
npm run worktree:spawn -- feat/a feat/b --worktree-jobs

# Create from a specific base ref
npm run worktree:spawn -- feat/a feat/b --base release/1.15

# Create from the default branch on origin (origin/HEAD)
npm run worktree:spawn -- feat/a --head
```

Notes:

- If a target folder already exists but is not a registered worktree, the script errors; `git worktree prune` (and/or removing the folder) usually fixes this.
- Designed for POSIX environments (macOS/Linux). Windows typically requires WSL or Git Bash.

## `postinstall.js`

`chmod +x` for `scripts/spawn-worktree.sh` during `npm install`, so `npm run worktree:spawn` works reliably on fresh checkouts.
