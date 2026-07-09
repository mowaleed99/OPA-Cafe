# TODO: Upgrade electron-builder (5 High Vulnerabilities)

**Severity:** 5 HIGH  
**Reported by:** `npm audit --audit-level=moderate`  
**Vulnerability path:** `electron-builder` → `tar`  
**Current version:** `24.13.3`  
**Suggested fix version:** `26.15.3` (via `npm audit fix --force`)

## Why it was deferred

`npm audit fix --force` performs a **breaking upgrade** to `electron-builder`. The Electron packaging pipeline (`npm run build:electron`) already timed out once during the audit run and produces a native installer — any breaking change here requires a full end-to-end packaging test on Windows before it can be safely merged.

## Steps to resolve

1. Create a separate branch: `git checkout -b chore/upgrade-electron-builder`
2. Run the upgrade: `npm audit fix --force`
3. Verify the full packaging pipeline completes without errors:
   ```
   npm run build:electron
   ```
4. Install and smoke-test the generated installer from `dist-electron/`.
5. Merge the branch once verified.

## References

- npm advisory: https://github.com/advisories (search `tar`)  
- electron-builder changelog: https://github.com/electron-userland/electron-builder/releases

---
*Logged: 2026-07-10 — Do not delete this file until the upgrade is complete and tested.*
