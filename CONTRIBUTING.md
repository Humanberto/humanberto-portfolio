# Contributing

## Git workflow

### Branching

- `main` is production-ready and deploys to [humanberto.com](https://www.humanberto.com).
- Use short-lived feature branches for larger work: `feat/design-versions`, `fix/oauth-redirect`, etc.
- Open a pull request into `main` when ready for review.

### Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Messages are validated by a `commit-msg` hook.

**Format:**

```text
<type>(<optional scope>): <short summary>

<optional body>

<optional footer>
```

**Types:**

| Type       | Use for                                      |
|------------|----------------------------------------------|
| `feat`     | New user-facing capability                   |
| `fix`      | Bug fix                                      |
| `docs`     | Documentation only                           |
| `style`    | Formatting, no logic change                  |
| `refactor` | Code change without feature/fix              |
| `perf`     | Performance improvement                      |
| `test`     | Tests                                        |
| `build`    | Build tooling or dependencies                |
| `ci`       | CI/CD configuration                          |
| `chore`    | Maintenance, scripts, repo hygiene           |
| `revert`   | Revert a previous commit                     |

**Examples:**

```text
feat(design): add version history for site and project themes
fix(auth): redirect OAuth callback to onboarding for new tenants
docs: document Supabase redirect URLs for local dev
```

**Rules:**

- Use imperative mood in the subject: `add`, not `added`.
- Keep the subject line ≤ 100 characters.
- Prefer focused commits — one logical change per commit.
- Do not commit secrets (`.env.local`, service role keys, API keys).

### Commit commands

Stage and commit with a heredoc so multi-line messages stay formatted:

```bash
git add path/to/files
git commit -m "$(cat <<'EOF'
feat(scope): short summary

Optional body explaining why, not just what.
EOF
)"
```

Useful flags:

- `git commit -m "message"` — single-line message (must pass commitlint).
- `git commit --amend` — only on unpushed commits you authored; avoid on shared `main`.

### Push commands

First push on a new branch:

```bash
git push -u origin HEAD
```

Updates to an existing tracking branch:

```bash
git push origin main
```

Before pushing to `main`, run:

```bash
npm run build
```

Do not use `git push --force` on `main` unless explicitly coordinated.

### Hooks setup

After `npm install`, Husky installs automatically via the `prepare` script. If hooks are missing locally:

```bash
npm install
npx husky
```

To bypass hooks in an emergency (avoid on shared branches):

```bash
git commit --no-verify -m "..."
```

Only use `--no-verify` when you understand why the hook failed.
