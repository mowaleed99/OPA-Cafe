# O P A Cafe — Current State & Handoff Document

**Target Audience:** Any AI agent picking up this project.
**Purpose:** To provide a low-token summary of the project's current state, architecture, and immediate next steps without needing to read the entire chat history.

## 1. Project Overview & Stack
- **Project:** Offline-first Point of Sale (POS) for O P A Cafe.
- **Tech Stack:** React, Vite, Tailwind CSS v4, shadcn/ui, Zustand (state), Dexie.js (offline DB), Supabase (remote DB & Auth), `vite-plugin-pwa` (PWA support), `i18next` + `react-i18next` (localization), `html2pdf.js` (PDF export), Electron (desktop app).
- [x] Basic Routing (React Router).
- [x] Basic UI Shell & Navigation (Tailwind, Lucide Icons).
- [x] Authentication Context (Zustand + Supabase/local mock).
- [x] Clean Architecture Layers (Core, Application, Infrastructure, Presentation).
- [x] Core Entities (User, Category, Product, Table, Order, Supplier).
- [x] Local Database Setup (Dexie.js).
- [x] Basic Sync Queue Mechanism.
- [x] Print CSS & Layout Adjustments.
- [x] Settings Cleanup & Sync (Removed tax/currency, syncing to Dexie).
- [x] Inventory & Products Separation (Inventory for stock, Products for sale).
- [x] Products UI Refactored to Group by Category.
- [x] Translations extracted into separate `en.json` and `ar.json` files, updated to Egyptian Arabic terms.
- [x] Electron desktop app configured and buildable as Windows `.exe` installer.
- **Core Requirement:** The app MUST be offline-first. Writes go to Dexie first, then sync to Supabase when online.

## 2. Current Architecture (Clean Architecture)

```text
src/
├── core/                  # Domain Layer (NO React/Supabase/Dexie imports here)
│   ├── entities/          # Core models (Product, Order, etc.)
│   └── repositories/      # Interfaces for data access
├── application/           # Application Layer
│   ├── useCases/          # Business logic orchestrators
│   │   ├── pos/           # POS: loadPOSData, placeOrder, checkoutOpenOrder, etc.
│   │   ├── tables/        # Tables: getTables, tableManagement
│   │   ├── products/      # Inventory: manageProducts, manageCategories
│   │   ├── closing/       # Daily Closing (dailyClosing.ts) + Monthly Closing (monthlyClosing.ts)
│   │   ├── dashboard/     # Dashboard: getDashboardStats
│   │   └── suppliers/     # Suppliers: manageSuppliers, managePurchases
│   ├── store/             # Zustand stores (useAuthStore, useCartStore, useSettingsStore)
│   ├── i18n/              # i18next config with Arabic (default) and English translations
│   └── sync/              # Offline sync queue (syncQueue.ts)
├── infrastructure/        # Frameworks & Drivers
│   ├── database/          # Dexie.js local DB setup (db.ts)
│   ├── api/               # Supabase client setup
│   └── repositories/      # Concrete implementations
└── presentation/          # UI Layer (React)
    ├── components/        # Shared UI (shadcn: button, input, dialog, table, tabs, select)
    ├── features/          # Feature-specific UI (pos/, products/)
    ├── layouts/           # AppLayout.tsx (sidebar with RTL support), AuthLayout.tsx
    ├── lib/               # UI utilities
    └── pages/             # Route components (one per module)
```

## 3. What Has Been Completed

### All Feature Modules — COMPLETE ✅
1. ✅ **POS Screen** — category tabs, product grid, cart panel, takeaway payment, dine-in support.
2. ✅ **Tables** — dine-in table management, navigate to POS with `table_id`, open/close orders.
3. ✅ **Products & Categories (Inventory)** — CRUD with soft-delete. Search bar + pagination added.
4. ✅ **Daily Closing** — `closingDay()` aggregates paid orders → snapshot. PDF & CSV export using `html2pdf.js`.
5. ✅ **Dashboard** — KPI cards + 7-day bar chart.
6. ✅ **Suppliers & Purchases** — CRUD, multi-line purchase orders, supplier payments. Search + pagination added.
7. ✅ **Users** — owner creates cashier accounts via Supabase Edge Function (`create-cashier`).
8. ✅ **Settings** — Language (Arabic/English + RTL), Currency (EGP/USD), Cafe Name, Tax Rate, Print Paper Size.
9. ✅ **Reports (Monthly Closing)** — Month picker, aggregated daily closings, CSV export, browser Print.
10. ✅ **Backup & Restore** — Full JSON export/import of all local Dexie tables.
11. ✅ **Electron Desktop App** — Configured to build as a Windows NSIS installer (`npm run build:electron`). Named "OPA Cafe", uses the cafe logo (512×512 in `build/icon.png`).

## 4. Important Implementation Notes

### Settings Store (`useSettingsStore`)
- Persisted in `localStorage` via Zustand `persist`.
- Fields: `language ('ar'|'en')`, `currency ('EGP'|'USD')`, `cafeName`, `taxRate`, `printPaperSize ('A4'|'80mm'|'58mm')`.
- `App.tsx` subscribes to `language` to update `document.documentElement.dir` (RTL/LTR) and call `i18n.changeLanguage`.

### Arabic / i18n
- Default language: Arabic (`ar`). RTL layout applied automatically via `dir` attribute on `<html>`.
- Translation file: `src/application/i18n/i18n.ts`. Both `ar` and `en` keys must be kept in sync when adding new text.
- All sidebar nav labels use `t(labelKey)` — never hardcode UI text directly.

### PDF Export
- `jsPDF` was removed (garbled Arabic). Replaced with `html2pdf.js` which captures browser-native DOM rendering.
- Used in `ClosingPage.tsx`. Wrap the element to capture in `id="closing-report-content"`.

### Currency
- Never hardcode `$` or `EGP`. Always read `{ currency }` from `useSettingsStore()`.

### Sync Pattern (ALWAYS follow this)
All write use cases must:
1. Write to Dexie first (`await db.<table>.add/put/delete(...)`)
2. Call `await enqueueSync('insert'|'update'|'delete', '<table>', payload)` — imported from `../../sync/syncQueue`
3. Use `crypto.randomUUID()` for IDs (NOT the `uuid` npm package — it's not installed)

### Initial Data Sync — `pullInitialData.ts` (IMPORTANT)
- Runs once on first login when the local Dexie DB is empty (detected by checking `categories` count).
- Fetches all Supabase data for the cafe in bulk.
- Child table fetches (`order_items`, `purchase_items`, `daily_closing_items`) are **chunked in batches of 100 IDs** to avoid HTTP 414 URI Too Long errors. Do NOT revert to non-chunked `.in()` queries.
- If dashboard or reports show empty data on a new device, the user must clear the local IndexedDB (`indexedDB.deleteDatabase('CafeDatabase')` in browser console) to force a re-sync.

### POS Performance — `ProductCard.tsx`
- `ProductCard` is wrapped in `React.memo` to prevent full grid re-renders when the cart updates.
- `handleAddProduct` in `POSPage.tsx` is wrapped in `useCallback` to avoid breaking the memo.
- Do NOT remove these optimizations — without them INP spikes to 400–500ms.

### getCategories — Supabase Fallback
`manageCategories.ts` → `getCategories()` tries Dexie first, then falls back to Supabase if local is empty.

### Supabase Schema — `categories` table
```sql
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'inactive'));
```
Already applied to the Supabase project.

### Known Pre-existing TypeScript Errors (Non-blocking)
- `setup-admin-service.ts` — one-off admin script
- `supabase/functions/create-cashier/index.ts` — Deno Edge Function

## 5. Electron Desktop App

### Running in Development
```bash
npm run dev:electron
```
⚠️ **IMPORTANT:** The Vite dev server runs on port `3000`. If port 3000 is occupied by another process (e.g., another `npm run dev` terminal), Vite will fall back to 3001/3002/etc., and `wait-on` will stall waiting for port 3000. Always kill other dev servers before running `dev:electron`.

### Building the Windows Installer (.exe)
```bash
npm run build:electron
```
Output: `dist-electron/OPA Cafe Setup 0.0.0.exe`

### Electron Configuration
- `electron/main.cjs` — Main process. Loads `http://localhost:3000` in dev, or `dist/index.html` in production.
- `webPreferences`: `nodeIntegration: false`, `contextIsolation: true` — **required**. Enabling nodeIntegration causes a white screen with Vite/React.
- `build/icon.png` — 512×512 app icon (regenerated from the original OPA-logo.png which was too small for electron-builder's 256×256 minimum).
- `electron-builder` is pinned to `^24.13.3` — **do NOT upgrade to v25/v26** as they vendor a version of `@noble/hashes` that is ESM-only and breaks on Node 22.11 (ERR_REQUIRE_ESM).

## 6. Remaining / Future Work
- **PWA Icons** — `pwa-192x192.png` and `pwa-512x512.png` missing from `/public`. The manifest references them; user wants to decide on PWA separately.
- **Multi-tenant onboarding** — Flow for configuring a brand new cafe client (Phase 4 in the technical plan).
- **Full Inventory** — Stock quantities, stock movements, low-stock alerts (post-launch feature).
- **Scheduled backups** — Automatic periodic database backups (post-launch feature).

## Important Context Files
- `cafe-system-technical-plan.md` — Full system requirements and roadmap
- `cafe-system-design-brief.md` — UI/UX design principles and screen details
- `.env` — Supabase API keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `src/application/store/useSettingsStore.ts` — Global settings (language, currency, cafe config)
- `src/application/i18n/i18n.ts` — All translation strings (ar + en)
- `src/application/store/useAuthStore.ts` — Auth state, role helpers
- `src/infrastructure/database/db.ts` — Dexie schema
- `electron/main.cjs` — Electron main process
- `build/icon.png` — 512×512 app icon for Electron builds
