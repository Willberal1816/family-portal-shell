# Moran School External Trigger Anchor V2

This is an intentionally unmerged draft pull-request anchor for the existing
Moran School GitHub-to-ChatGPT event-driven review architecture.

Reason for rotation: the original PR #4 reached GitHub's 2,500-comment limit
on November 11, 2026 and can no longer receive trigger comments.

Keep this pull request open and in draft. **Do not merge or close it while
it is the active external trigger anchor.**

The authoritative scheduled workflow remains
`.github/workflows/moran-school-trigger-clock.yml` on `main`.
It posts top-level PR Conversation comments containing
`MORAN_HOMESCHOOL_REVIEW_TRIGGER`, and the existing event-driven
`Moran School Trigger GitHub` ChatGPT task is the consumer.

Do not turn on a separate ChatGPT schedule.
