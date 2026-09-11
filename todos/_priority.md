# Priority and rationale

Items 1–4 of the 2026-09-03 security + API review have shipped, plus db-failure resilience
(0.1.1, tag `v0.1.1`) and session renewal (0.2.0, tag `v0.2.0`). Neither is on npm yet:
publish 0.2.0 from `main`. anani stays pinned to 0.0.30 until then; anani #380 waits on it.
anani-side follow-ups live in `~/dev/anani/todos/`.

| # | todo | who | size | why here |
|-|-|-|-|-|
| 1 | session-features-remaining.md | design first | M | logout-all, deletion, sweep; each adds an AuthDB method (breaking). Renewal shipped in PR #9 |

Done items go to `todos/done/MMDD-<name>.md` with `branch:` / `pull-request:` in the
frontmatter.
