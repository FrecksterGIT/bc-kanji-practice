# Technical documentation

Kanji Practice is a client-side single-page app for drilling kanji and vocabulary readings. It uses the user's own [WaniKani](https://www.wanikani.com) data. There is no backend: the browser talks to the WaniKani v2 API directly and keeps everything in IndexedDB.

> Written from the source code. The manual browser run was against v2.13.3; the automated e2e suite covers the current version. See [Verification status](#verification-status).

## Scope and non-goals

- The app reads WaniKani `user`, `subjects` and `assignments`. It never writes anything back to WaniKani.
- There is no scoring and no spaced repetition. Correct answers are tracked in memory for the current list only.
- There is no i18n layer. The UI is English.
- There is no service worker, so the app does not work offline. Data already synced to IndexedDB is kept, but the app still needs the network to load.

## Tech stack

| Area            | Choice                                                   |
| --------------- | -------------------------------------------------------- |
| UI              | React 19, TypeScript                                     |
| Toolchain       | Vite+ (`vp` CLI: Vite, Rolldown, Vitest, Oxlint, Oxfmt)  |
| Styling         | Tailwind CSS 4 via `@tailwindcss/vite` (`src/index.css`) |
| Routing         | `react-router` 8                                         |
| Storage         | IndexedDB via `idb`                                      |
| Kana input      | `wanakana`                                               |
| Audio           | `react-use-audio-player`                                 |
| Misc hooks      | In-house hooks (`src/hooks`), `nanoid`                   |
| Package manager | pnpm                                                     |
| Release         | semantic-release (conventional commits)                  |

Exact versions are in `package.json`.

## Getting started

```sh
vp install            # or: pnpm install
pnpm run dev          # vp dev, default http://localhost:5173 (next free port if taken)
```

No environment variable is needed. Open the app, go to **Settings** and enter a WaniKani API token. The first start downloads the whole subject set, so expect a wait on the "Updating data..." screen.

| Command               | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `pnpm run dev`        | Dev server                                                                |
| `pnpm run build`      | Production build into `dist/`                                             |
| `pnpm run preview`    | Serve the build                                                           |
| `pnpm run check`      | Format, lint, type check (`vp check`)                                     |
| `pnpm run typecheck`  | `tsc` for `tsconfig.app.json` and `tsconfig.e2e.json` (`--noEmit`)        |
| `pnpm run test`       | Vitest (`vp test`)                                                        |
| `pnpm run e2e`        | Playwright end-to-end tests (starts the dev server)                       |
| `pnpm run e2e:record` | Re-record the HAR from the real WaniKani API (needs `wkapikey` in `.env`) |

Per `AGENTS.md`: run `vp install` after pulling, and `vp check` and `vp test` before finishing a change. Use `vp run <script>` for project scripts, since built-ins such as `vp dev` take precedence over scripts of the same name.

`vite.config.ts` also defines `__APP_VERSION__` (from `npm_package_version`, shown in the nav bar), sorts Tailwind classes in the formatter, and puts all `node_modules` code in one `vendors` chunk.

## Project layout

```
src/
  main.tsx                 mounts Suspense > SessionProvider > WanikaniProvider > ApplicationRouter
  App.tsx                  layout route: ItemProvider + audio provider + Navigation + <Outlet>
  wanikani.d.ts            types for subjects, assignments, collections, user
  contexts/                SessionContext/Provider, WanikaniProvider, ItemContext/Provider,
                           WanikaniContext.ts (API base URL, resource paths, ResourceType; no React context)
  hooks/                   useSession, useItems, useSelectedItems, useRelatedVocabulary,
                           useKanjiComposition, usePlayVocabulary, ...
  utils/                   itemDB.ts (IndexedDB), wkLoad.ts (API client with backoff),
                           wkSync.ts (resumable sync, cached per key), session.ts (startup promise cache),
                           syncProgress.ts (loading counter store), typeChecks.ts (type guards),
                           formatHint.ts (mnemonic markup)
  components/
    router/                ApplicationRouter.tsx
    pages/                 Items.tsx (practice), Settings.tsx
    kanji/                 KanjiDetails, InfoTable, RelatedVocabulary, Mark
    vocabulary/            VocabularyDetails, InfoTable, ContextSentences, Composition
    navigation/            Navigation, MobileMenu, HelpOverlay
    shared/                KanaInput, List, SelectableButton, MainTerm, ProgressBar, ...
public/                    favicons, robots.txt, .htaccess (Apache SPA rewrite + caching)
docs/                      this documentation + WaniKani API reference (wanikani-api.yml, wanikani.txt)
e2e/                       Playwright specs, support/test.ts (login fixture that replays the HAR),
                           record.setup.ts (HAR recorder), scripts/sanitize-har.ts, fixtures/wanikani.har
```

## Architecture

### Provider tree

```
StrictMode
 └ Suspense               shared "Updating data..." loading screen
    └ SessionProvider     settings (IndexedDB), API key validation, user, maxLevel
       └ WanikaniProvider sync gate for WaniKani -> IndexedDB
          └ ApplicationRouter
             └ App           (layout route)
                └ ItemProvider      current section, item list, selected index, answer validation
                   └ AudioPlayerProvider
                      └ Navigation + <Outlet>
```

State is plain React Context. There is no state library and no router loader layer.

### Login and routing

`SessionProvider` loads the persisted settings and then calls `GET /v2/user` with the saved key.

- Success: `isLoggedIn = true`, `maxLevel` = the user's WaniKani level.
- No key or request failure: `isLoggedIn = false`, `maxLevel = 3`.

`ApplicationRouter` depends on `isLoggedIn`:

- Logged in: `/` redirects to `/kanji`. Routes are `/kanji`, `/vocabulary`, `/marked`, `/settings`.
- Logged out: only `/settings` exists. `/` (an index route) and every other path redirect there.

`SessionProvider` always renders its children once it is active. The shared Suspense boundary in `main.tsx` shows the loading screen while the persisted settings, user lookup, and WaniKani sync promises resolve.

The user lookup is cached per API key in `session.ts`. A failed lookup (network error or rejected key) is cached as `null` for the page's lifetime, so re-saving the same key does not retry until a reload. A different key is looked up again.

### API client (`src/utils/wkLoad.ts`)

A single `fetchFn` sends `GET` with `Authorization: Bearer <apiKey>` and `Wanikani-Revision: 20170710` and is exposed as `wkLoad.subjects`, `wkLoad.assignments` and `wkLoad.user`. There is no request cache. Responses with status 429 or 5xx are retried up to three times. For 429 it waits until the `RateLimit-Reset` time (at most 60 seconds); otherwise it backs off 1, 2 and 4 seconds. Other non-2xx responses (for example 401) throw `WanikaniHttpError` at once, and network failures (`fetch` rejecting) are not retried. The per-key caching happens one level up: `getUser` (`session.ts`) and `getSync` (`wkSync.ts`) each keep one promise per API key for the page's lifetime.

### Sync (`src/utils/wkSync.ts`)

1. Read the "last synced" timestamp of each resource and the stored sync scope from the `meta` store. A resource whose timestamp is less than `SYNC_MAX_AGE_MS` (12 hours) old is skipped, and a resource without one gets a full sync. Skipped resources are not requested and their timestamps are not touched, so the next load after 12 hours syncs them. The scope is `<user id>:<max_level_granted>` (`syncScopeFor`). If it differs from the current account's, every timestamp is ignored: both resources get a full sync, and assignments are cleared first, because they belong to one account. The scope is written only after both resources finish. The user lookup (`/v2/user`) is not part of this step and runs on every page load (see `getUser` above).
2. Load subjects (`/v2/subjects?types=kanji,vocabulary,kana_vocabulary`) and assignments (`/v2/assignments?started=true`) in parallel (`Promise.allSettled`).
3. Per resource: request the first page (with `updated_after=<timestamp>` for an incremental sync), then follow `pages.next_url` until it is empty. This applies to full and incremental syncs alike.
4. Every page is written to IndexedDB (`put`) as it arrives.
5. Only after the last page of a resource is stored, its timestamp is written to `meta`. The value is the client clock from before the first request, minus a five-minute margin for clock skew and items that changed during the run. A run that stops half-way therefore leaves the old timestamp in place and the next run starts again from there; nothing is skipped.
6. While syncing, Suspense shows a full-screen "Updating data... (N resources loaded)" message. `N` counts requests through `syncProgress.ts`, which is an external store so the fallback can update outside the suspended provider tree.

`getSync` resolves to a `SyncResult`: `{ status: "ok" }` or `{ status: "failed", error }`. It never rejects.

`WanikaniProvider` gates on it: when logged in, it calls `use(getSync(apiKey, syncScopeFor(user)))`. The result is cached per API key, so StrictMode retries do not duplicate the sync. Changing the API key creates a new cached result and suspends until that key's sync completes, so saving a new key in Settings shows the loading screen: first the user lookup, then the sync. On a reload within 12 hours of the last sync, the sync resolves at once without requests, so only the user lookup remains and the loading screen is barely visible. If the sync failed, the error is logged to the console, a red banner ("Updating data from WaniKani failed...") with a **Try again** button appears above the app, and the app keeps working with the data already in IndexedDB. **Try again** calls `retrySync(apiKey)` and remounts the children, so the item hooks read the new data.

### Persistence (`src/utils/itemDB.ts`)

Database `db`, version 2:

| Object store  | Key                         | Notes                                        |
| ------------- | --------------------------- | -------------------------------------------- |
| `subjects`    | `id`                        | index `level` on `data.level`                |
| `assignments` | `id`                        |                                              |
| `settings`    | `key` (always `"settings"`) | one record                                   |
| `meta`        | `key`                       | `syncedAt:<resource>` and `syncScope` values |

The upgrade handler has one `if (oldVersion < n)` block per version and never drops `settings`. Version 2 adds `meta`. Because an upgraded database has no `syncedAt` values, the first start after the upgrade does a full sync, which also re-fetches anything an older, truncated incremental sync missed.

Persisted settings (`PersistedSettings`, `src/contexts/SessionContext.tsx`): `apiKey`, `limitToLearned`, `limitToCurrentLevel`, `sorting` (`id` | `nextReview` | `randomize`), `level`, `markedItems` (subject ids). They are saved on every change. If the saved settings cannot be read, they are cleared and the app starts with the default settings; the API key and marked items must then be entered again.

### Item selection (`src/hooks/useSelectedItems.ts`)

| Section      | Items                                                               |
| ------------ | ------------------------------------------------------------------- |
| `kanji`      | kanji of the selected level                                         |
| `vocabulary` | `vocabulary` and `kana_vocabulary` of the selected level            |
| `marked`     | subjects whose ids are in `markedItems`, any level, no level filter |

Level-based sections are filtered to the selected level, and further to subjects with an assignment that has `started_at` when `limitToLearned` is on. Sorting:

- `id`: by WaniKani id.
- `nextReview`: by the assignment's `available_at`, items without one last.
- `randomize`: `Math.random() - 0.5` comparator. The nav links push a fresh `nanoid()` into the router `state` when clicked in this mode, which re-runs the load and reshuffles.

Subjects load from IndexedDB, not from the network.

### Answer validation (`src/contexts/ItemProvider.tsx`)

`validValues` for the current item:

- Kanji: every reading with `accepted_answer`.
- Vocabulary: every accepted reading, its `toHiragana` form, and, if it contains katakana, a character-by-character hiragana form.
- Kana vocabulary: the characters converted to hiragana.

`validate(input)` adds or removes the item id in `validItems` (the in-memory "answered" list). `moveToNext` jumps to the next item that is not yet in `validItems`, wrapping around. When the list changes the index and `validItems` reset.

### Kana input (`src/components/shared/KanaInput.tsx`)

Romaji typed by the user is converted live with `wanakana.toHiragana`, with `nn` mapped to `ん`. A trailing `n` or `ny` is left unconverted until the next character. Enter validates: red border on a wrong answer, green border and a check mark on a correct one, and Enter again on a correct answer calls `moveToNext`. A global click handler re-focuses the field, except when a `<select>` is clicked.

### Practice page (`src/components/pages/Items.tsx`)

`Items` takes a `section` prop, calls `setSection` in `ItemProvider`, and renders `KanjiDetails` or `VocabularyDetails` for the current item. With an empty list it shows "Sorry, couldn't find any items to show." It shows `selectedIndex + 1 / items.length` with an arrow button that toggles the `List` overlay, and handles Left/Right (disabled while the list is open) and Alt+A.

`KanjiDetails` renders, in order: `MainTerm`, `ProgressBar`, `KanaInput`, `RelatedVocabulary`, `InfoTable`. `ProgressBar` is a 2 px line whose width is `validItems.length / items.length`. `RelatedVocabulary` loads `amalgamation_subject_ids` of the kanji from IndexedDB, sorts by level, and, with `limitToCurrentLevel`, drops words above the user's level. Each word is a `Mark` button (despite the name, it does not mark anything): it shows a tooltip on hover and plays the audio on click.

The `InfoTable` components (kanji and vocabulary) and `MarkButton` register their own global `keydown` handlers for Alt+S and Alt+M.

### Mnemonic markup (`src/utils/formatHint.ts`)

WaniKani mnemonics contain tags such as `<reading>` and `<kanji>`. `formatHint` turns them into styled `<mark>` elements. It is covered by `formatHint.spec.ts`.

## Keyboard shortcuts

| Key               | Action                                           | Defined in                                |
| ----------------- | ------------------------------------------------ | ----------------------------------------- |
| Left / Right      | Previous / next item                             | practice page                             |
| Alt+Up / Alt+Down | Previous / next level (wraps)                    | `Navigation.tsx`                          |
| Alt+A             | Open or close the item list                      | practice page                             |
| Alt+S             | Show or hide the item details                    | practice page                             |
| Alt+M             | Mark or unmark the current item                  | practice page                             |
| Enter             | Submit the answer, then go to the next item      | `KanaInput.tsx`                           |
| Esc               | Close the help overlay, mobile menu or item list | `HelpOverlay.tsx`, `MobileMenu.tsx`, list |

## Quality, CI and release

- **Tests:** two layers.
  - _Unit tests:_ Vitest through `vp test`. Specs sit next to their sources in `src/`; the sync-related ones are `wkSync.spec.ts` (pagination, resume, the 12-hour freshness rule, the scope guard, failure and retry), `wkLoad.spec.ts` (429/5xx backoff) and `syncProgress.spec.ts` (the loading counter store). Vitest excludes `e2e/**`.
  - _End-to-end tests:_ Playwright Test (`pnpm run e2e`). Five spec files under `e2e/` cover login and sync, answer input, navigation, marking, and settings. They replay a committed HAR file (`e2e/fixtures/wanikani.har`) instead of calling the real WaniKani API, so they run offline and without credentials. `playwright.config.ts` runs Chromium only at 1280x800 and starts `pnpm run dev` on port 5173; it reuses a dev server that is already running, except in CI.
- **Re-recording the HAR:** run `pnpm run e2e:record` with a valid `wkapikey` in `.env`. The recorder opens the app, logs in, waits for the full sync, and writes the raw HAR. Then `e2e/scripts/sanitize-har.ts` trims it to levels 1–2, replaces account details with fixed values, strips all request headers (including the Authorization header), and fails the script if the API key is still present anywhere in the output.
- Lint and format: Oxlint (`correctness` = error, not type-aware) and Oxfmt, both through `vp check`.
- `.github/workflows/pull-request.yml` (PRs to `main`): frozen-lockfile install, check, typecheck, test, Playwright Chromium install, `pnpm run e2e`, build.
- `.github/workflows/deploy.yml` (push to `main`): the same checks and e2e tests, a build, then `semantic-release`, a production build and an FTP upload of `dist/`. The FTP step needs the secrets `ftp_server`, `ftp_user` and `ftp_password`.
- Both workflows upload `playwright-report/` as an artifact (kept 7 days) when a step fails. In CI, Playwright retries each failed test once.
- `dependabot.yml`: daily npm updates.
- `.releaserc.json`: conventional commits decide the version. Plugins: commit-analyzer, release-notes-generator, changelog, exec (formats `CHANGELOG.md`), npm (publish disabled), git (commits `package.json`, `pnpm-lock.yaml`, `CHANGELOG.md` as `chore(release): X [skip ci]`), github.
- Deployment is a static upload. `public/.htaccess` rewrites unknown paths to `index.html` and sets cache lifetimes (one year for images and media, two hours for HTML, JS and CSS).

## Known limitations

- **The API key is stored unencrypted** in IndexedDB, and the Settings field is a plain `type="text"` input, so the key is visible on screen.
- **No offline mode** (no service worker or manifest).
- **Duplicate heading on Settings.** Both the limit checkboxes and the sort radios sit under a heading called "Sorting".
- **A failed token check is remembered until reload.** Re-saving the same key does not look it up again.
- **Test coverage is partial.** There are no unit tests for the item hooks (`useSelectedItems`, `ItemProvider`) or for `itemDB.ts` itself (the DB upgrade path is untested).

## Verification status

Manual run on v2.13.3 (historical). The code was read first, then the app was driven in headless Chromium (Playwright 1.64.1, run through `@playwright/test` against the dev server, with a real WaniKani account):

- **Confirmed:** first-time sync and the "Updating data..." screen; login and the top bar; the Kanji, Vocabulary and Marked pages; the item list (Alt+A); details toggling (Alt+S); marking (Alt+M, the count in the top bar went 0 to 1); level change (Alt+Down went from level 1 to 2, Alt+Up back to 1); a wrong answer giving a red border; the help overlay; the mobile menu.
- **Not exercised in that run:** a correct answer and Enter to advance, the three sort modes, "limit to learned", the audio, and the incremental sync on a second start. The e2e suite below now covers all of these except the audio and the random sort mode.
- **Automated, current version:** `pnpm run e2e` runs 29 Playwright tests against the dev server and the committed HAR. They cover the logged-out redirect from `/` and from other paths, bad and good tokens, the nav with the username, a second load, romaji and `nn` input, wrong and correct answers, Enter to advance, the arrow keys, Alt+S, related vocabulary, vocabulary composition and context sentence, the item list and Esc, the help overlay, the mobile menu button, the level selector with Alt+Up and Alt+Down, marking and clearing marks, "limit to learned", sorting by WaniKani id and by next review date, and settings surviving a reload.
- **Still not exercised by the e2e suite:** audio playback (the fixture aborts `.mp3` requests), the random sort mode, the mobile menu's Esc key, and "limit shown vocabulary to current level". The second-load test checks only that the nav reappears; it does not assert that an `updated_after` request was made.
- **Suspense refactor (commit `93ca08d`):** on 2026-11-04, on branch `refactor/suspense`, `vp check`, `vp test` (11 tests in 3 files), `pnpm run typecheck` and `pnpm run e2e` (29 of 29 passed) all passed.

Screenshots in `docs/images/` have the username and API key masked.
