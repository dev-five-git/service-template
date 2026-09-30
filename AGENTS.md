# AGENTS.md

Conventions for agents working in a repository created from `service-template`.
Read this before writing code. The rules here are the ones that have actually
been broken, not a general style guide.

## What this project is

| Part | Stack |
|------|-------|
| `apps/front`, `apps/admin` | **Next.js App Router**, run by [vinext](https://vinext.dev/) on Vite |
| Styling | `@devup-ui/react` + `@devup-ui/reset-css` |
| API client | `@devup-api/fetch`, `@devup-api/react-query` (generated from `openapi.json`) |
| `apis/api` | Rust / Axum (vespera), schemas in `vespertide.json` |
| Package manager | **bun** workspaces (`apps/*`) |
| Lint | `oxlint` with the config from `eslint-plugin-devup`, React Compiler rules included |
| React Compiler | On in both apps: `vinext({ react: { compiler: true } })` + `oxc-transform-react` |
| TypeScript | Apps: TS 7 (`@typescript/native`). Root `typescript`: TS 6 alias for lint tooling |
| Agent tooling | [devup-mcp](https://github.com/dev-five-git/devup-mcp), see section 7 |

## 1. This is a Next App Router project. `vite.config.ts` does not say otherwise.

**`vinext` is a drop-in replacement for the `next` CLI that runs Next.js on
Vite.** So a perfectly normal App Router app here has a `vite.config.ts`, no
`next.config.ts`, and uses `@devup-ui/vite-plugin`. None of that makes it a
Vite SPA.

The evidence is in `apps/front/package.json`:

```jsonc
"scripts": { "dev": "vinext dev", "build": "vinext build", "start": "vinext start" },
"dependencies": { "vinext": "...", "react": "^19" }
```

and in `apps/front/src/app/layout.tsx`, which imports `from 'next'`.

**Therefore:**

- Routing is **file routing** under `src/app/`. One directory per route.
- There is **no `main.tsx` and no `index.html`**. If you are creating one, you
  have misread the project.
- Do not switch screens with local state. This is the single most common way
  this template gets misimplemented:

```tsx
// WRONG - hand-rolled SPA routing
const [screen, setScreen] = useState<Screen>('home')
return screen === 'home' ? <Home /> : <Settings />
```

```tsx
// CORRECT - one route per screen, the framework owns navigation
// src/app/page.tsx, src/app/settings/page.tsx
import Link from 'next/link'
```

## 2. Never author a CSS file

There is no `.css` or `.scss` file in this template and none should be added.
devup-ui extracts styling at build time; a hand-written stylesheet is invisible
to it and competes silently with the generated classes.

| Need | Use |
|------|-----|
| Reset | `resetCss()` — already called in `apps/front/src/app/layout.tsx` |
| Document-level rules (`body`, `*`, `@font-face`) | `globalCss({ ... })` |
| Component styling | Style props on `Box`/`Flex`/`Text`, or `css({ ... })` |
| A runtime value | A style prop — devup-ui emits a CSS variable |

The only acceptable CSS import is a stylesheet **shipped by an installed
package you do not author**, such as an offline webfont package.

Do not invent class names for styling either. `className` is for a `css()`
result, not for a hand-written selector.

## 3. File placement

```
apps/front/src/
├── app/          # ONLY layout.tsx and page.tsx. Nothing else.
├── components/
│   ├── common/   # shared across pages
│   ├── layout/   # Header, Footer, ...
│   └── pages/    # page-specific: pages/<route>/Component.tsx
├── contexts/  hooks/  stores/  utils/
└── api.ts
```

- One component per file. `export default` **only** in `page.tsx`.
- Page components get a descriptive name ending in `Page` (`HomePage`, not
  `Page`) — see the existing `apps/front/src/app/page.tsx`.
- Server Components are the default. Add `'use client'` only when the file
  itself needs `useState`/`useEffect`/`useRouter`, defines an event handler
  internally, or uses `framer-motion`.
- Single-colour SVG icons go to `public/icons/*.svg` and are used with
  `<Image src="/icons/x.svg" />`, not written as React components.

## 4. Theme tokens

`apps/admin` has a `devup.json`; `apps/front` does not yet. When you add one,
the `$token` names in code must come from that file. `$token` only resolves in
a **JSX prop** — in an external object use `var(--token)`.

Read the real names with `devup_project_context` (scope `theme`) instead of
guessing them. Colors and lengths take a `$` prefix (`bg="$primary"`);
typography takes the bare name (`typography="bodyS"`).

## 5. Verify before you claim it works

```bash
bun run lint                  # cargo clippy/fmt/check, then oxlint
bunx oxlint --deny-warnings   # warnings count: keep them at 0
bun tsc --noEmit              # inside the app you changed (TS 7)
bun test                      # bun test
cargo clippy -- -D warnings && cargo fmt --check   # if you touched apis/
```

`bun run build` builds both apps. `bun run test` also runs `cargo tarpaulin`
afterwards, which does not work on Windows; there, run `bun test` and
`cargo test` instead.

Run the dev server from inside the app (`cd apps/front && bun dev`), not with
`bun -F front dev`, which leaves zombie processes.

The dev server needs `@devup-ui/vite-plugin` 1.0.72 or later; with older
versions every edit sends the dev server into a reload loop. Do not work
around that with `server.watch.ignored` for `df/devup-ui`: it hides
`globalCss` changes until the dev server restarts.

## 6. Setup that looks wrong but is intentional

- **Two TypeScripts.** The apps run TS 7 (`"@typescript/native": "npm:typescript@^7.0.2"`,
  so `bun tsc` inside an app is TS 7). The root `typescript` is an alias to
  `@typescript/typescript6`, because typescript-eslint, which
  `eslint-plugin-devup` loads into oxlint, cannot run on TS 7. Keep both when
  upgrading dependencies.
- **React Compiler through vinext.** vinext does not read `reactCompiler: true`
  from a Next config, and `@vitejs/plugin-react` 6 no longer uses Babel. The
  compiler is on through `vinext({ react: { compiler: true } })` with
  `oxc-transform-react` installed. Do not add `babel-plugin-react-compiler`.
- **Write code for the compiler.** It memoizes for you, so new code does not
  need `useMemo`, `useCallback` or `memo` for performance. Avoid `useEffect`:
  derive values during render, do DOM work in a ref callback that returns its
  cleanup, and handle user actions in event handlers. If an effect has to
  stay, say why in the PR.

## 7. Develop with devup-mcp

Use [devup-mcp](https://github.com/dev-five-git/devup-mcp) for anything that
touches design, theme tokens, the API or the DB. It reads the real
`devup.json`, `openapi.json`, vespertide models and Figma file, so nothing has
to be guessed.

| Task | Tool |
|------|------|
| Before writing UI | `devup_project_context` scope `theme` (and `ui` for components to reuse) |
| Calling the API or touching the DB | `devup_project_context` scope `api` or `db` |
| Implementing a Figma screen | `devup_figma_auth` `status`, then `devup_figma_export`. Read `devup://guide/usage` first. Its `tsx` is the deliverable: do not rewrite it from a screenshot, and never guess a color, spacing or font value |
| After writing devup-ui TSX | `devup_ui_validate` with `projectRoot` |
| After changing routes, models or `openapi.json` | `devup_stack_diff` |
| One feature across screen, API and DB | `devup_feature_trace` from an explicit anchor (route, operationId, table) |
| Comparing a rendered screenshot with the design | `devup_visual_compare` |

If devup-mcp is not connected or a call fails, say so. Do not fall back to
guessing.

### Skills

The full conventions live in agent skills, not in this file. `devup_skills`
reports which ones are missing and installs the ones devup-mcp carries:

```
devup_skills { "action": "status" }
devup_skills { "action": "install" }
```

| Skill | Covers |
|-------|--------|
| `devfive-frontend` | Structure, Server Components, the rules above in detail |
| `devup-ui` | Style props, responsive arrays, `$token`, what extracts statically |
| `vespera` / `vespertide` | The Rust API and its DB schemas |
| `changepacks` | Versioning; `.changepacks/config.json` decides which files need a changepack log |

`status` also lists repository obligations such as changepacks. Create a log
with `bunx @changepacks/cli --yes --update-type <major|minor|patch> --message "..."`;
without these flags the CLI opens an interactive prompt.

This file is the minimum that has to be true even when no skill is loaded.
