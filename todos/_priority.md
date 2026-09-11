# Priority and rationale

Items 1–4 of the 2026-09-03 security + API review have shipped; 0.1.0 is published to npm.
What is left is below. anani-side follow-ups live in `~/dev/anani/todos/`.

| # | todo | who | size | why here |
|-|-|-|-|-|
| 1 | session-features-remaining.md | design first | M | logout-all, deletion, sweep; each adds an AuthDB method (breaking). Renewal shipped in PR #9 |

db-failure-resilience is done on `fix/db-failure-resilience` (0.1.1, unpublished). anani stays
pinned to 0.0.30 until 0.1.1 is on npm.

Done items go to `todos/done/MMDD-<name>.md` with `branch:` / `pull-request:` in the
frontmatter.
