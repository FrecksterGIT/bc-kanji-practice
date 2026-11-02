# Technical documentation

Kanji Practice is a client-side single-page app for drilling kanji and vocabulary readings. It uses the user's own [WaniKani](https://www.wanikani.com) data. There is no backend: the browser talks to the WaniKani v2 API directly and keeps everything in IndexedDB.

> Written from the source code and checked against the running app (v2.13.3). See [Verification status](#verification-status).

## Scope and non-goals

- The app reads WaniKani `user`, `subjects` and `assignments`. It never writes anything back to WaniKani.
- There is no scoring and no spaced repetition. Correct answers are tracked in memory for the current list only.
- There is no i18n layer. The UI is English.
- There is no service worker, so the app does not work offline. Data already synced to IndexedDB is kept, but the app still needs the network to load.

## Tech stack

| Area            | Choice                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| UI              | React 19, TypeScript                                                      |
| Toolchain       | Vite+ (`vp` CLI: Vite, Rolldown, Vitest, Oxlint, Oxfmt)                   |
| Styling         | Tailwind CSS 4 via `@tailwindcss/vite` (`src/index.css`)                  |
| Routing         | `react-router` 8                                                          |
| Storage         | IndexedDB via `idb`                                                       |
| HTTP cache      | `async-cache-dedupe` (in-memory, de-duplicates requests)                  |
| Kana input      | `wanakana`                                                                |
| Audio           | `react-use-audio-player`                                                  |
| Misc hooks      | `beautiful-react-hooks` (`useGlobalEvent`, `useResizeObserver`), `nanoid` |
| Package manager | pnpm                                                                      |
| Release         | semantic-release (conventional commits)                                   |

Exact versions are in `package.json`.

## Getting started

```sh
vp install            # or: pnpm install
pnpm run dev          # vp dev, default http://localhost:5173 (next free port if taken)
```

No environment variable is needed. Open the app, go to **Settings** and enter a WaniKani API token. The first start downloads the whole subject set, so expect a wait on the "Updating data..." screen.

| Command              | Purpose                               |
| -------------------- | ------------------------------------- |
| `pnpm run dev`       | Dev server                            |
| `pnpm run build`     | Production build into `dist/`         |
| `pnpm run preview`   | Serve the build                       |
| `pnpm run check`     | Format, lint, type check (`vp check`) |
| `pnpm run typecheck` | `tsc -p tsconfig.app.json --noEmit`   |
| `pnpm run test`      | Vitest (`vp test`)                    |

Per `AGENTS.md`: run `vp install` after pulling, and `vp check` and `vp test` before finishing a change. Use `vp run <script>` for project scripts, since built-ins such as `vp dev` take precedence over scripts of the same name.

`vite.config.ts` also defines `__APP_VERSION__` (from `npm_package_version`, shown in the nav bar), sorts Tailwind classes in the formatter, and puts all `node_modules` code in one `vendors` chunk.

## Project layout

```
src/
  main.tsx                 mounts SessionProvider > WanikaniProvider > ApplicationRouter
  App.tsx                  layout route: ItemProvider + audio provider + Navigation + <Outlet>
  wanikani.d.ts            types for subjects, assignments, collections, user
  contexts/                SessionContext/Provider, WanikaniContext/Provider, ItemContext/Provider
  hooks/                   useSession, useWanikani, useItems, useSelectedItems,
                           useRelatedVocabulary, useKanjiComposition, usePlayVocabulary, ...
  utils/                   itemDB.ts (IndexedDB), wkLoad.ts (API + cache),
                           typeChecks.ts (type guards), formatHint.ts (mnemonic markup)
  components/
    router/                ApplicationRouter.tsx
    pages/                 Items.tsx (practice), Settings.tsx
    kanji/                 KanjiDetails, InfoTable, RelatedVocabulary, Mark
    vocabulary/            VocabularyDetails, InfoTable, ContextSentences, Composition
    navigation/            Navigation, MobileMenu, HelpOverlay
    shared/                KanaInput, List, SelectableButton, MainTerm, ProgressBar, ...
public/                    favicons, robots.txt, .htaccess (Apache SPA rewrite + caching)
docs/                      this documentation + WaniKani API reference (wanikani-api.yml, wanikani.txt)
```

## Architecture

### Provider tree

```
StrictMode
 └ SessionProvider        settings (IndexedDB), API key validation, user, maxLevel
    └ WanikaniProvider    sync WaniKani -> IndexedDB, loading screen
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
- Logged out: only `/settings` exists and everything else redirects there.

`SessionProvider` renders its children only once the user lookup has finished.

**Logged-out root is blank.** The catch-all `path: "*"` route sits under the `/` layout route and does not match the bare `/`, so a logged-out visit to `/` renders the navigation bar and an empty page instead of redirecting to `/settings`. Any other path redirects correctly. Adding an index route with `<Navigate to="/settings" replace />` would fix it.

### API client (`src/utils/wkLoad.ts`)

A single `fetchFn` sends `GET` with `Authorization: Bearer <apiKey>` and `Wanikani-Revision: 20170710`. A non-2xx response throws. It is registered three times on an in-memory `async-cache-dedupe` cache as `subjects`, `assignments` and `user`, so identical concurrent requests are de-duplicated and repeated ones are cached for the page's lifetime.

### Sync (`src/contexts/WanikaniProvider.tsx`)

1. Read all subjects and assignments from IndexedDB and take the newest `data_updated_at` of each.
2. If a newest date exists, request `/subjects` or `/assignments` once with `updated_after=<date>` (incremental update).
3. Otherwise do a full load: request the first page, then follow `pages.next_url` until it is empty.
4. Every page is written to IndexedDB (`put`) as it arrives.
5. While syncing, a full-screen "Updating data... (N resources loaded)" message is shown. `N` counts requests.

The effect runs again whenever the API key or login state changes.

### Persistence (`src/utils/itemDB.ts`)

Database `db`, version 1:

| Object store  | Key                         | Notes                         |
| ------------- | --------------------------- | ----------------------------- |
| `subjects`    | `id`                        | index `level` on `data.level` |
| `assignments` | `id`                        |                               |
| `settings`    | `key` (always `"settings"`) | one record                    |

The upgrade handler deletes and recreates all stores when the version changes, so a version bump wipes the cached data and the settings, including the API key and marked items.

Persisted settings (`PersistedSettings`, `src/contexts/SessionContext.tsx`): `apiKey`, `limitToLearned`, `limitToCurrentLevel`, `sorting` (`id` | `nextReview` | `randomize`), `level`, `markedItems` (subject ids). They are saved on every change.

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

WaniKani mnemonics contain tags such as `<reading>` and `<kanji>`. `formatHint` turns them into styled `<mark>` elements. This is the one unit-tested module (`formatHint.spec.ts`).

## Keyboard shortcuts

| Key               | Action                                      | Defined in              |
| ----------------- | ------------------------------------------- | ----------------------- |
| Left / Right      | Previous / next item                        | practice page           |
| Alt+Up / Alt+Down | Previous / next level (wraps)               | `Navigation.tsx`        |
| Alt+A             | Open or close the item list                 | practice page           |
| Alt+S             | Show or hide the item details               | practice page           |
| Alt+M             | Mark or unmark the current item             | practice page           |
| Enter             | Submit the answer, then go to the next item | `KanaInput.tsx`         |
| Esc               | Close the help overlay or the item list     | `HelpOverlay.tsx`, list |

## Quality, CI and release

- Tests: Vitest through `vp test`. Only `src/utils/formatHint.spec.ts` exists.
- Lint and format: Oxlint (`correctness` = error, not type-aware) and Oxfmt, both through `vp check`.
- `.github/workflows/pull-request.yml` (PRs to `main`): frozen-lockfile install, check, typecheck, test, build.
- `.github/workflows/deploy.yml` (push to `main`): the same checks, then `semantic-release`, a production build and an FTP upload of `dist/`. The FTP step needs the secrets `ftp_server`, `ftp_user` and `ftp_password`.
- `dependabot.yml`: daily npm updates.
- `.releaserc.json`: conventional commits decide the version. Plugins: commit-analyzer, release-notes-generator, changelog, exec (formats `CHANGELOG.md`), npm (publish disabled), git (commits `package.json`, `pnpm-lock.yaml`, `CHANGELOG.md` as `chore(release): X [skip ci]`), github.
- Deployment is a static upload. `public/.htaccess` rewrites unknown paths to `index.html` and sets cache lifetimes (one year for images and media, two hours for HTML, JS and CSS).

## Known limitations

- **Incremental sync is not paginated.** `load()` in `WanikaniProvider.tsx` fetches once when a `updated_after` date exists and ignores `next_url`. A large delta (for example after a long absence) is truncated until a later sync picks up the rest.
- **The API key is stored unencrypted** in IndexedDB, and the Settings field is a plain `type="text"` input, so the key is visible on screen.
- **No offline mode** (no service worker or manifest).
- **Blank page on `/` when logged out** (see [Login and routing](#login-and-routing)).
- **A database version bump wipes all local data**, including settings.
- **Duplicate heading on Settings.** Both the limit checkboxes and the sort radios sit under a heading called "Sorting".
- **A failed sync is not reported.** The loading flag is only cleared in the `.then` of `Promise.all`, so a rejected request can leave the loading screen up.
- **Test coverage is minimal.**

## Verification status

The code was read first, then the app was driven in headless Chromium (Playwright 1.64.1, run through `@playwright/test` against the dev server, with a real WaniKani account):

- **Confirmed:** first-time sync and the "Updating data..." screen; login and the top bar; the Kanji, Vocabulary and Marked pages; the item list (Alt+A); details toggling (Alt+S); marking (Alt+M, the count in the top bar went 0 to 1); level change (Alt+Down went from level 1 to 2, Alt+Up back to 1); a wrong answer giving a red border; the help overlay; the mobile menu.
- **Found while checking:** the blank page on `/` when logged out (see [Login and routing](#login-and-routing)).
- **Not exercised:** a correct answer and Enter to advance, the three sort modes, "limit to learned", the audio, and the incremental sync on a second start.

Screenshots in `docs/images/` have the username and API key masked.
