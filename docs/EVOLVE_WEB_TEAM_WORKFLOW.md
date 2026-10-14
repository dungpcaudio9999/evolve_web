# Evolve Web – Team Development Workflow

> 🇻🇳 Vietnamese version: [EVOLVE_WEB_TEAM_WORKFLOW.vi.md](./EVOLVE_WEB_TEAM_WORKFLOW.vi.md)
> Related: [ROLES.md](./ROLES.md) · [TIMELINE.md](./TIMELINE.md)

This document defines the collaboration workflow for all members of the `evolve_web` project.

## 1. Branch Model

```text
main ◄──── release PR (end of each week / milestone)
 │
 └── dev ◄──── PR + review (every task)
      │
      ├── feature/<task-id>-<name>
      ├── fix/<task-id>-<name>
      ├── refactor/<scope>
      └── docs/<topic>
```

| Branch | Purpose | Deploy |
|---|---|---|
| `main` | Stable branch; only receives merges from `dev` | Production (Vercel + Render) |
| `dev` | Integration branch for ongoing development | Preview |
| `feature/*` | A new feature or task | – |
| `fix/*` | A bug fix | – |
| `refactor/*` | Refactoring without behavior change | – |
| `docs/*` | Documentation changes | – |

**Branch naming:** include the task ID from [TIMELINE.md](./TIMELINE.md) so every branch and PR can be traced back to its task.

```text
feature/W3-C2-issue-create
feature/W3-B1-auth-api
feature/W5-C1-board-drag-drop
fix/W6-A2-login-redirect
docs/api-endpoints
```

### Branch protection (set up by the team lead on GitHub)

For both `main` and `dev`:
- Require a pull request before merging (no direct pushes).
- Require at least **1 approval**.
- Require CI status checks to pass (lint, typecheck, build, test).

---

## 2. Daily Workflow

```text
Task assigned → Update dev → Create branch → Develop → Local check
→ Commit → Push → Pull Request → Review → Squash merge → Clean up
```

### Step 1 – Update `dev` and the environment

```bash
git switch dev
git pull --ff-only origin dev

# Sync dependencies and the database schema (monorepo + Prisma)
pnpm install
pnpm --filter api prisma migrate dev
```

> If `git pull --ff-only` fails, you have probably committed directly on your local `dev` by mistake. Do not force anything; ask the team lead.

### Step 2 – Create a branch for the task

```bash
git switch -c feature/W3-C2-issue-create
```

### Step 3 – Develop and check locally

Before committing, run the checks related to your change:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test        # if the changed area has tests
```

### Step 4 – Commit

Review your changes first, then add **only the files related to the task**:

```bash
git status
git diff
git add apps/web/components/issues/create-issue-modal.tsx
git commit -m "feat(issue): add create issue modal"
```

> Avoid a blind `git add .`. Never commit `.env` files (secrets such as `DATABASE_URL`, `JWT_SECRET`); only `.env.example` is committed.

Commit message format ([Conventional Commits](https://www.conventionalcommits.org/)):

```text
feat(scope): description       # new feature
fix(scope): description        # bug fix
refactor(scope): description   # code change without behavior change
docs(scope): description       # documentation
test(scope): description       # tests
chore(scope): description      # config, dependencies, tooling
```

Common scopes: `web`, `api`, `shared`, `issue`, `project`, `auth`, `board`, `ci`.

### Step 5 – Keep your branch up to date with `dev`

If `dev` has changed while you are working (especially before opening a PR):

```bash
git fetch origin
git rebase origin/dev
# Resolve conflicts if any:
#   edit the conflicting files → git add <file> → git rebase --continue
#   to abort: git rebase --abort
git push --force-with-lease
```

> Only rebase **your own** task branch. Never rebase or force-push `dev` or `main`.
> If you are not comfortable with rebase, `git merge origin/dev` is also acceptable.

### Step 6 – Push the branch

```bash
git push -u origin feature/W3-C2-issue-create
# later updates:
git push
```

---

## 3. Pull Request and Review

### Creating a PR

- **Target:** `dev`.
- **Title:** `[W3-C2] Create issue modal`.
- **Description** (use the PR template):
  - What was changed and why
  - How to test it
  - Screenshots / GIF for UI changes
  - `Closes #<issue number>` so the task moves to **Done** automatically
- Keep each PR focused on **one task**. Large PRs are hard to review; split them if needed.
- Open a **Draft PR** early if you want feedback before finishing.

### Review

| PR author | Reviewer |
|---|---|
| B or C | A (team lead) |
| A | B or C |

```text
Developer ── create PR ──► Reviewer
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
              Approve               Request changes
                 │                         │
                 │                Developer fixes + pushes
                 │                         │
                 │                    Review again
                 ▼                         │
          Squash and merge ◄───────────────┘
                 │
                 ▼
                dev
```

- Reviewers should respond within **24 hours**.
- Do not merge with unresolved comments or failing CI.
- Merge method: **Squash and merge** (one commit per PR on `dev`).

### Special rules

- PRs that change **`packages/shared`** (the contract between frontend and backend) must tag **all members** and be approved by the team lead.
- **Only B (backend) creates Prisma migrations.** Others who need a schema change should ask B, to avoid conflicting migrations.
- Never commit secrets, `node_modules`, or build output.

### After merge

```bash
git switch dev
git pull --ff-only origin dev
git branch -d feature/W3-C2-issue-create   # delete local branch
git fetch --prune                          # clean up deleted remote branches
```

---

## 4. Release: `dev` → `main`

At the end of each week, when the milestone in [TIMELINE.md](./TIMELINE.md) is reached:

1. The team lead creates a PR `dev → main` titled `Release M<n>`.
2. CI must pass; the team checks the preview deployment.
3. Merge using **Create a merge commit** (keeps `main` and `dev` in sync).
4. Tag the release:
   ```bash
   git switch main && git pull --ff-only origin main
   git tag v0.<n>
   git push origin v0.<n>
   ```
5. Production is deployed automatically from `main`.

**Urgent fix on production:** still create `fix/*` from `dev`, merge into `dev`, then make a release PR `dev → main`. Do not commit directly to `main`.

---

## 5. Team Rules (summary)

1. Never push directly to `main` or `dev`.
2. One task = one branch = one PR.
3. Always start from the latest `dev`, then run `pnpm install` and `prisma migrate dev`.
4. Branch and PR names include the task ID (`W3-C2`).
5. Run lint / typecheck / build before pushing.
6. Commit only related files; never commit `.env`.
7. Every PR needs 1 approval and green CI before merge.
8. Contract (`packages/shared`) changes require the whole team to be notified.
9. Only the backend member creates Prisma migrations.
10. Blocked for more than **2 hours**? Ask in the team chat immediately.

---

## 6. Quick Reference

```bash
# 1. Start a task
git switch dev && git pull --ff-only origin dev
pnpm install && pnpm --filter api prisma migrate dev
git switch -c feature/<task-id>-<name>

# 2. Work, check, commit
pnpm lint && pnpm typecheck && pnpm build
git status && git diff
git add <files>
git commit -m "feat(scope): description"

# 3. Sync with dev and push
git fetch origin && git rebase origin/dev
git push -u origin feature/<task-id>-<name>     # or: git push --force-with-lease after a rebase

# 4. Open PR → dev, get review, squash and merge

# 5. Clean up
git switch dev && git pull --ff-only origin dev
git branch -d feature/<task-id>-<name> && git fetch --prune
```

> **Principle:** members work independently on short-lived task branches; `dev` is the shared integration branch; `main` only receives tested releases at each milestone.
