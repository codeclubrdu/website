# Contributing

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm typecheck` — `astro check`

## Git hooks (lefthook)

Installed automatically by `pnpm install` (via the `prepare` script).

- **pre-commit** (parallel, auto-restages fixes):
  - `prettier --write` on staged `*.{js,mjs,ts,astro,md,mdx,json,css,yml,yaml}`
  - `eslint --fix` on staged `*.{js,mjs,ts,astro}`
- **pre-push**: `pnpm typecheck`

Manual run: `pnpm lefthook run pre-commit` / `pnpm lefthook run pre-push`.
You can skip it if need be, but it'll always run in CI: `git commit --no-verify` / `git push --no-verify`.

## CI

`.github/workflows/ci.yml` runs on push/PR to `main`: `format:check`, `lint`, `typecheck`, `build`. Must be green to merge.

## PRs

Branch from `main`. No direct pushes to `main` — open a PR.

## No AI policy

This project does not accept contributions generated wholly or in part by AI/LLMs. This includes, but is not limited to:

- Code (whole files, functions, snippets, or completions beyond trivial autocomplete)
- Comments and documentation
- Commit messages and PR descriptions
- Issues, bug reports, and comments on discussions

**Why.** Code Club RDU exists so people curate their craft by writing code themselves. It defeats the purpose to not write it themselves.

**What counts as AI-generated.** Anything where an LLM produced the substance: Copilot writing the function body, ChatGPT/Claude drafting your PR description, an agent opening the PR on your behalf. Spell-check, grammar tools, search engines, and IDE refactors (rename, extract) all are fine.

**If you used AI to learn.** That's great — that's what the tools are for, I would even encourge this behavior if you have already struggled with finding a solution for a time. But before you open a PR, throw the AI output away and write the everything yourself. Another option is to ask in the Discord!

**Enforcement.** PRs suspected of being AI-generated will be closed without detailed review. Repeated violations get you blocked from the repo. If you're unsure whether something crosses the line, just ask.
