# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

Pure-Angular component versions of Fomantic UI's jQuery modules — a library so consumers can use Fomantic UI without jQuery. This is the **Elevated Signals fork** of the upstream `ngx-fomantic-ui`. The published package is `@elevatedsignals/ngx-fomantic-ui` on GitHub Packages (registry `https://npm.pkg.github.com`), not the public npm package — version stays in lockstep with Angular major (currently 19.x).

Treat this fork as the source of truth for ES consumers; do not auto-port upstream changes without checking that they don't conflict with the fork-only fixes (e.g., the popup positioning null-guards in `f55c70c`, the popper.js → floating-ui swap in `d115d8f`).

## Workspace layout

Angular CLI workspace with two projects under `projects/`:

- **`ngx-fomantic-ui`** — the library (selector prefix `fui`), built with `ng-packagr`, output to `dist/ngx-fomantic-ui/`. Entry file: `projects/ngx-fomantic-ui/src/index.ts`. Peer-deps: `@angular/{common,core} 19.x`. Real deps: `@floating-ui/dom`, `date-fns`, `tslib`.
- **`ngx-fomantic-ui-docs`** — Angular app demoing every component (selector prefix `app`). Doubles as the manual-verification harness — there are almost no unit tests (see Testing), so visual checks in this app are the primary regression signal.

## Commands

```bash
# Library: production build + locale post-processing (use this, not bare ng build)
npm run build:lib:prod

# Library: locale .d.ts post-processing only (run after ng build if iterating)
npm run lib:compile:locales

# Docs site (manual verification harness)
npm run serve:docs                  # http://localhost:4200
npm run build:docs:prod

# Tests — Karma + Jasmine, watch mode by default (singleRun: false)
npm test                            # all projects, opens Chrome
ng test ngx-fomantic-ui             # library only
ng test ngx-fomantic-ui --watch=false --browsers=ChromeHeadless   # CI-style single run

# Lint — ESLint via @angular-eslint (migrated from TSLint as part of the v19 upgrade)
npm run lint
```

There is no `npm run lib:compile` or `npm run demo:serve` despite what the upstream README says — those scripts don't exist in `package.json`. Use the commands above.

### Running a single spec

The library currently has exactly one spec: `projects/ngx-fomantic-ui/src/collections/pagination/components/pagination.spec.ts`. Karma's config has no built-in spec filter, so to focus on one test use Jasmine's `fdescribe` / `fit` in the spec, or run `ng test ngx-fomantic-ui --include='**/pagination.spec.ts'`.

### Locale build is non-trivial

`build:lib:prod` runs three things in order: `ng build` (ng-packagr) → a separate `tsc` against `behaviors/localization/tsconfig.locales.json` → `scripts/locales.js`, which rewrites `./interfaces/values` imports inside the emitted locale `.d.ts` files to `../index`. Skipping any step yields a package that compiles but breaks consumers' locale imports. If you change anything under `src/behaviors/localization/`, run the full `build:lib:prod`, not just `ng build`.

## Library architecture

Top-level groups under `projects/ngx-fomantic-ui/src/`:

- `modules/` — full components (accordion, checkbox, collapse, datepicker, dimmer, dropdown, modal, popup, progress, rating, search, select, sidebar, tabs, toast, transition).
- `collections/` — message, pagination.
- `behaviors/` — localization (with locale files compiled separately, see above).
- `misc/util/` — shared helpers, services (e.g. `PositioningService`), the `FuiUtilityModule`.
- `fui.module.ts` — `FomanticUIModule` re-exports every feature module so consumers can do a single import.

### The `internal.ts` / `public.ts` convention (load-bearing)

Every feature directory has both `internal.ts` and `public.ts` barrel files. They are not duplicates:

- **`internal.ts`** — exports everything in the module. Other modules inside this library import from each other via `internal.ts` only (e.g. `popup/popup.module.ts` imports from `'../transition/internal'`). This avoids circular barrel imports through the top-level `index.ts` and is how past circular-dep bugs (datepicker, search) were fixed.
- **`public.ts`** — curated re-export list of just the symbols meant for consumers. Sometimes renames internal types into the public surface (e.g. popup re-exports `PositioningPlacement` as `PopupPlacement`).

The library's `index.ts` re-exports only `*/public`. **When adding a new symbol: add it to `internal.ts` first, then add to `public.ts` only if it's part of the consumer API.** Never import another module's `public.ts` from inside the library.

### Standard module shape

Each module mirrors this layout (popup is the canonical example):

```
modules/<name>/
  classes/      # framework-agnostic controllers, configs, lifecycle helpers
  components/   # @Component (the visible thing, e.g. FuiPopup)
  directives/   # @Directive (the user-facing API surface, e.g. [fuiPopup])
  services/     # @Injectable (DI tokens, runtime services)
  <name>.module.ts
  internal.ts
  public.ts
```

The `directives/` are usually thin — they delegate to a controller class in `classes/` so the same logic can power both directive-driven and template-driven (component) usage. When fixing behavior bugs, the bug is almost always in `classes/`, not the `@Directive`.

### Positioning

Popup, dropdown, search, etc. all use a shared `PositioningService` in `misc/util/services/` backed by `@floating-ui/dom` (replaced popper.js in `d115d8f`). When touching positioning, expect to also exercise popup, dropdown, and datepicker in the docs app — they share the service and regress together.

## Conventions

- Component selectors: `fui` prefix (library), `app` prefix (docs app).
- Style: ESLint config enforces single quotes (`quotes`), 140-char lines (`max-len`), warns on `!` non-null assertions (`@typescript-eslint/no-non-null-assertion`). Don't introduce `!` non-null assertions.
- Angular 19 (`@angular/core ^19.2.21`) + `zone.js ~0.15.1` + `rxjs ~7.8.1`. TypeScript `~5.8.3`.
- The library targets ES2022 module/target — don't add downlevel polyfills.

## What this fork has changed vs upstream

These are the deltas worth knowing before editing — they are easy to accidentally undo by pulling from upstream:

- Package name and registry (`@elevatedsignals/ngx-fomantic-ui` → GitHub Packages).
- Popper.js → floating-ui swap (`d115d8f`).
- Popup `positioningService` null-guards (`4bb00f1`, PR #7).
- date-fns 2.x compatibility for the locale package (`323b37c`).
- Datepicker was removed at Angular 13, then re-added (`966df87`).
- Upgraded to Angular 19 (from Angular 16) — `@elevatedsignals/ngx-fomantic-ui@19.0.0`.
