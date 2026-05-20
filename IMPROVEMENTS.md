# DIET — Improvements Backlog

A pass through the repo (root + `DIET/` Vite app) on 2026-05-20. Items are grouped roughly by impact. File references are clickable.

## High-impact / quick wins

- **Drop unused 3D dependencies.** [package.json](DIET/package.json) declares `three`, `@react-three/fiber`, `@react-three/drei`, but `grep` finds zero imports anywhere in [src/](DIET/src/). These pull ~MB into install/bundle for nothing. Either delete them or actually wire up the planned R3F view.
- **Move heavy image assets out of `src/assets`.** [src/assets/image/](DIET/src/assets/image/) is **43 MB** and [src/assets/detective/](DIET/src/assets/detective/) is **8.4 MB**. Importing them through Vite forces every PNG through the bundler graph and inflates `dist/` (currently **47 MB**). Either:
  - move static, non-hashed images to [public/](DIET/public/) and reference by URL, or
  - run them through an image pipeline (WebP/AVIF + responsive sizes) — most are PNG screenshots that compress 5–10× as WebP.
- **Commit the build output out of the repo.** [DIET/dist/](DIET/dist/) (47 MB) and the `tsbuildinfo` files (`tsconfig.tsbuildinfo`, `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo`) plus `vite-dev.log` / `vite-dev.err.log` look tracked. Add to [.gitignore](DIET/.gitignore) and remove from history if so.
- **Empty placeholder folders.** [src/components/inspector/](DIET/src/components/inspector/) and [src/components/pipeline/](DIET/src/components/pipeline/) are empty. Delete or actually use them — empty dirs are a "what was I doing here?" trap for the next session.

## Code structure / maintainability

- **`Chapter1SamplingBias.tsx` is 500 lines and doing too much** — narrative state, history snapshots, portrait selection, background selection, scene branching, tutorial signals, and Verdict/Restart wiring all live in the same file. ([Chapter1SamplingBias.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx)). Suggested splits:
  - extract narrative/history machine (lines 122–258) into a `useChapterNarrative` hook,
  - move `getPortraitForText` (lines 30–46) and `getChapterBackground` (lines 48–66) into a `passageMeta.ts` module — the keyword-match portrait selector is fragile (note the duplicate "sampling bias"/"accuracy"/"data" branch at lines 37 and 42; the second one is unreachable),
  - turn the big `characterContent` switch (lines 323–456) into a passage→component map.
- **`Chapter3Alignment.tsx` (578 lines) and `Chapters.tsx` (388 lines)** have the same shape — long components combining routing/search params, narrative state, and rendering. Same hook+map refactor would help.
- **Mixed JS/TS in [Chapter2-COMPAS/](DIET/src/pages/Chapters/Chapter2-COMPAS/).** [index.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/index.jsx), [CharacterActivity.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/CharacterActivity.jsx), [CycleDiagram.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/CycleDiagram.jsx), [FairnessPoll.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/FairnessPoll.jsx), [FieryReport.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/FieryReport.jsx), [ReportCard.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/ReportCard.jsx), [StatsMonitor.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/StatsMonitor.jsx) are `.jsx` with a sidecar [index.d.ts](DIET/src/pages/Chapters/Chapter2-COMPAS/index.d.ts). Chapters 1 and 3 are fully TS. Convert Chapter 2 to TS for parity and to surface prop bugs.
- **Inconsistent CSS strategy.** Most components use CSS modules, but [JudgeDilemma.css](DIET/src/pages/Chapters/Chapter2-COMPAS/components/JudgeDilemma.css) and [RecidivismGame.css](DIET/src/pages/Chapters/Chapter2-COMPAS/components/RecidivismGame.css) are plain global CSS. Normalize to modules to avoid leakage.
- **Stray planning docs at repo root** ([CodePlan.md](CodePlan.md), [Flow.txt](Flow.txt), [Idea.txt](Idea.txt), [Preparation.md](Preparation.md), [SamplingBiasRoadmap.md](SamplingBiasRoadmap.md), [DIET sampling bias.md](DIET%20sampling%20bias.md), [AI-Bias.pdf](AI-Bias.pdf), [Project Description.pdf](Project%20Description.pdf)) and inside [DIET/MDs/](DIET/MDs/) duplicate roadmap/prep docs. Pick one `docs/` location, move them, and delete the obsolete ones.

## Type safety / correctness

- **120 occurrences of `any` / `as any` / `@ts-ignore`** across 19 files. The worst concentrations:
  - [VerdictPanel.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/VerdictPanel/VerdictPanel.tsx) (12),
  - [MissionPlanner.tsx](DIET/src/pages/Chapters/Chapter1-SamplingBias/components/MissionPlanner/MissionPlanner.tsx) (11),
  - [StoryIntro.tsx](DIET/src/pages/Chapters/components/StoryIntro/StoryIntro.tsx) (15),
  - [Chatbox.tsx](DIET/components/Chatbox/Chatbox.tsx) (20),
  - [Chapters.tsx](DIET/src/pages/Chapters/Chapters.tsx) (12).
  Tighten these — most are likely prop bags that just need a type.
- **Hardcoded magic numbers in [simulation.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/simulation.ts)** (lines 100–119: `0.38 + 0.36 * coverage + 0.08 * diversity`, `Math.min(0.12, usefulSignal / 7000)`, etc.). Extract as named constants with comments — these are the actual learning-design knobs of the simulation, and right now changing them is archaeology.
- **Duplicate code paths in `useInvestigationState`.** [useInvestigationState.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/hooks/useInvestigationState.ts) lines 166–206: `createSnapshot` and `restoreSnapshot` both deep-clone `dayPlans` with the same nested-spread block. Pull into a `cloneDayPlans()` helper. Also `resetInvestigation` (155–164) and `sendDetective` (146–152) repeat the same "reset planner defaults" block — extract.

## UX / a11y / polish

- **No `ErrorBoundary` anywhere.** A throw in any chapter blanks the whole app. Wrap each `<Route>` element in [App.tsx](DIET/src/App.tsx) (or the chapter switcher in [Chapters.tsx](DIET/src/pages/Chapters/Chapters.tsx)) in a boundary with a "reload chapter" fallback.
- **Accessibility is thin.** Only ~120 `aria-*` / `role` / `alt` occurrences across the whole UI, and the click-proxy button in [Chapter1SamplingBias.tsx:471](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L471) is an invisible full-screen `<button>` — confirm it's keyboard-focusable in a sensible order and not announced to screen readers when inactive. Run an axe/lighthouse pass.
- **No persistence.** Only [FairnessPoll.jsx](DIET/src/pages/Chapters/Chapter2-COMPAS/components/FairnessPoll.jsx) uses `localStorage`. Day-by-day investigation progress is lost on refresh, which is brutal for a 3-day in-game flow. Snapshot `useInvestigationState` to `localStorage` and restore on mount.
- **`Date.now() + Math.random()` plan IDs** in [useInvestigationState.ts:114](DIET/src/pages/Chapters/Chapter1-SamplingBias/hooks/useInvestigationState.ts#L114). Use `crypto.randomUUID()` (available in all modern browsers) for clarity.
- **`Demo.tsx` ([Demo.tsx](DIET/src/pages/Demo/Demo.tsx)) reaches across pages** to import chapter components from `../Chapters/Chapter1-SamplingBias/components`. Either promote those to a shared `src/features/sampling/` module or accept this is a dev-only sandbox and gate the route behind `import.meta.env.DEV`.

## Build / tooling

- **No linter.** No ESLint or Prettier config in the repo. Add `eslint` + `eslint-plugin-react-hooks` + `@typescript-eslint` and a `lint` npm script — a hook-deps lint alone would catch a few stale deps (e.g. [Chapter1SamplingBias.tsx:189](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L189): `nextImportantInstruction` `useMemo` depends on `passage` only, but the body branches don't use `strategy` — fine here, but representative).
- **No tests.** Pure-function simulation logic in [simulation.ts](DIET/src/pages/Chapters/Chapter1-SamplingBias/simulation.ts) (`calcMissionCost`, `summarizeStrategy`, `accOf`) is the perfect target for Vitest — small, deterministic, no React. Even 10 tests would lock in the learning-design tradeoffs.
- **No code splitting.** Every chapter is statically imported in [App.tsx](DIET/src/App.tsx) / [Chapters.tsx](DIET/src/pages/Chapters/Chapters.tsx). Switch to `React.lazy(() => import(...))` per chapter so the landing page doesn't ship Chapter 2 + 3 + Three.js (if you keep it) up front.
- **`vite.config.ts` is bare** ([vite.config.ts](DIET/vite.config.ts)). Add at minimum: `base` (if deploying to a sub-path), `build.sourcemap: true` for prod debugging, and `resolve.alias` (`@/` → `src/`) — the current `../../../assets/...` imports in chapter files are a maintenance smell.
- **`tsconfig.app.json` not reviewed here, but worth turning on** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noFallthroughCasesInSwitch` to catch the kind of array-index bugs the `regionAccs[i]` / `zoneSamples[idx]` code is exposed to.

## Documentation

- [README.md](DIET/README.md) only covers Chapter 2's player guide and is mislabeled — it says "Chapter 2" but describes the Chapter 1 sampling-bias flow. Fix the heading and add: how to run (`npm i && npm run dev`), project layout, and a one-line description of each chapter.
- No `CONTRIBUTING.md` / no architecture note explaining the passage / narrative-history / snapshot model — which is the single most non-obvious thing in the codebase. A short [DESIGN.md](DIET/DESIGN.md) update would save a future contributor an hour.

## Smaller nits

- `getPortraitForText` keyword matcher ([Chapter1SamplingBias.tsx:30–46](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L30-L46)) couples copy to portraits. Move the portrait choice into the passage data itself (each chunk picks its portrait), like Chapter 2 already does with `{ text, portrait }` in [Chapter2-COMPAS/index.jsx:13](DIET/src/pages/Chapters/Chapter2-COMPAS/index.jsx#L13).
- `getChapterBackground` ([Chapter1SamplingBias.tsx:48–66](DIET/src/pages/Chapters/Chapter1-SamplingBias/Chapter1SamplingBias.tsx#L48-L66)) has two `case` groups that both `return null`; collapse them.
- `mulberry32` seed in [simulation.ts:52](DIET/src/pages/Chapters/Chapter1-SamplingBias/simulation.ts#L52) is a hardcoded date — fine, but document that it's a fixed seed so re-deploys are deterministic.
- [.kilo/](DIET/.kilo/) and [.claude/](DIET/.claude/) at project root — confirm both are intended to be tracked (probably not).
