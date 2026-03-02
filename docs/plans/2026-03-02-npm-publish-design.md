# Design: Publishing @nitishz/clix to npm

**Date:** 2026-03-02
**Status:** Approved

## Overview

Publish `clix` — an AI-powered CLI for explaining, generating, updating, and saving shell commands — to npm as `@nitishz/clix`. Manual publish workflow, version 1.0.0, scoped package (public access).

## Decisions

- **Package name:** `@nitishz/clix` (scoped to avoid conflicts)
- **Version:** `1.0.0` (stable release)
- **Publish method:** Manual (`npm publish`)
- **CI/CD:** None (out of scope)

## Section 1 — package.json changes

| Field | Change |
|-------|--------|
| `name` | `"clix"` → `"@nitishz/clix"` |
| `files` | Add `["bin", "src"]` — whitelist only runtime files |
| `keywords` | Add `["cli", "ai", "shell", "command", "explainer", "anthropic", "claude"]` |
| `engines` | Add `{"node": ">=18.0.0"}` |
| `repository` | Add GitHub repo URL |
| `bugs` | Add GitHub issues URL |
| `homepage` | Add GitHub repo URL |
| `scripts.prepublishOnly` | Add `"npm test"` |

`index.js` is a scratch/test file (only contains `console.log` calls) and must NOT be included in the published package. The `files` whitelist handles this.

## Section 2 — README rewrite

The README must include:

1. **What it is** — one-sentence description of clix
2. **Prerequisites** — Node ≥18, Anthropic API key
3. **Install** — `npm install -g @nitishz/clix`
4. **Configuration** — how to set the API key:
   - Via env var: `export ANTHROPIC_API_KEY=your-key`
   - Via config file: `~/.clix/config.json` with `{"provider":"anthropic","apiKey":"your-key"}`
5. **Commands** — each with a short description and example:
   - `clix explain "<command>"` — explains what a shell command does
   - `clix generate "<description>"` — generates a shell command from plain English
   - `clix update "<command>" "<change>"` — modifies an existing command
   - `clix save "<command>" --name <alias>` — saves a command for later
   - `clix saved` — lists all saved commands
6. **License**

## Section 3 — Local verification

Before publishing, verify the package is correct:

1. `npm pack --dry-run` — preview files that would be included in the tarball
2. `npm pack` — create the actual `.tgz` and inspect contents
3. `npm link` — install globally from source, run `clix` to verify end-to-end
4. `npm unlink` — clean up after testing

## Section 4 — Publish

1. `npm whoami` — confirm logged in, or run `npm login`
2. `npm publish --access public` — required for scoped packages (private by default)
3. Verify at `https://www.npmjs.com/package/@nitishz/clix`
4. Test: `npm install -g @nitishz/clix` in a clean environment
