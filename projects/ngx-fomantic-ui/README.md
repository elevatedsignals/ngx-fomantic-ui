# @elevatedsignals/ngx-fomantic-ui

The Angular library project. See the [repository root README](../../README.md) for an overview.

## Build

Run `npm run build:lib:prod` from the repo root. This invokes `ng build ngx-fomantic-ui` plus the locale post-process step, which rewrites the emitted locale `.d.ts` import paths so consumers can `import` from `ngx-fomantic-ui/locales/...`. **Skipping the post-process produces a package that compiles but breaks consumers' locale imports** — always use the npm script, not bare `ng build`.

Build output lands in `/dist/ngx-fomantic-ui/`.

## Code scaffolding

Run `ng generate component component-name --project ngx-fomantic-ui` to add a new component. Equivalent for `directive|pipe|service|class|guard|interface|enum|module`.
> Note: pass `--project ngx-fomantic-ui` or the workspace's default project (the docs app) will be picked instead.

## Running unit tests

`ng test ngx-fomantic-ui` runs the suite via Karma.

## Publishing

This package publishes to GitHub Packages as `@elevatedsignals/ngx-fomantic-ui`. After `npm run build:lib:prod`, `cd dist/ngx-fomantic-ui && npm publish` (with the appropriate authentication for `npm.pkg.github.com`).
