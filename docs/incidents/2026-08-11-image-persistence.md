# Incident: Images silently disappearing from published content
**Date:** August 11, 2026
**Affected:** Sullivan Parks & Rec admin (all content types — event, program, project, park_info)
**Status:** Resolved

## Summary
Images inserted into `body_html` via the admin "Insert media" picker would
display correctly in admin Preview, but never appear on the live public
site. The images were genuinely lost — not a caching or rendering issue —
though the loss was silent: no error was shown to the editor at any point.

## Root cause
`ContentList.js`'s Edit button opened `ContentForm` using whatever `row`
object was already sitting in that browser tab's React state from the last
time the list loaded. That row was never refetched from the database.

With multiple browser tabs open to the admin panel over time (a normal
part of this project's workflow), an **older tab** could still be holding
a **stale copy** of an item — e.g. a snapshot from before images were
added to it in a different, more recent tab/session. If that older tab was
later used to make any edit and save — even something small and unrelated,
like fixing a typo — it would silently overwrite the current database row
with its stale copy, erasing whatever had changed since (in this case, the
inserted images).

This explains why the bug looked so confusing in isolation:
- Preview always looked correct, because it renders the form's local
  in-memory state, not the saved database row.
- The images upload to Supabase Storage successfully and the URLs are
  genuinely public — the storage layer was never at fault.
- No error appeared anywhere, because `upsertContent()` succeeded — it
  just successfully wrote stale data.
- The bug was intermittent and inconsistent with "did I click Save,"
  because it depended on *which tab* the save came from, not on any
  single action being wrong.

## What was ruled out along the way
Before finding the actual cause, the following were checked and eliminated
— worth keeping on record so they aren't re-litigated on a future bug:
- Local `public/` folder images not deployed to Vercel (this bug DID
  affect the site's separate `bike-rodeo.png` cover image issue, but was
  a distinct, unrelated problem — see note below)
- CSP / `next.config.mjs` image domain restrictions
- HTML sanitizer stripping `<img>` tags (none exists in this codebase)
- Postgres triggers, CHECK constraints, or RLS policies on `body_html`
  (schema inspected directly — nothing found)
- Deployment/DNS/CDN routing (confirmed via direct `curl` against the
  deployed asset and against the Supabase REST API)

**Related but separate issue:** the event's `cover_url` field
(`bike-rodeo.png`) was pointing at a file served from the Next.js
`public/` folder rather than Supabase Storage. That file *was* correctly
committed and deployed — the earlier appearance of a 404 was edge-cache
propagation lag shortly after a deploy, not a missing file. This is
unrelated to the `body_html` image-loss bug above, but was investigated
in the same session and is worth knowing about if `cover_url` images
ever seem to lag behind a deploy.

## Fix
1. **`ContentList.js`** — the Edit action now calls `getContentById(row.id)`
   to fetch the current database row immediately before opening
   `ContentForm`, instead of reusing whatever was cached in the list.
2. **`ContentForm.js`** — added a conflict guard in `save()`. Before
   writing, it re-checks the database's current `updated_at` against a
   snapshot taken when the form opened. If they differ — meaning the item
   was saved elsewhere while this form was open — the editor is warned
   before allowing an overwrite, rather than it happening silently.

Fix #1 prevents the case that actually happened here (a stale tab reopened
later). Fix #2 is a second line of defense for the narrower case of two
tabs open to the *same* item at the *same* time, which a fetch-on-open
alone can't catch.

## Lesson: stale browser tabs after a deploy
During this session, deploying fix #1 did **not** immediately resolve the
symptom in testing — because the admin tab being used to test had been
open since *before* the deploy, and kept running the old JavaScript
bundle. A Vercel deploy updates what a *fresh* page load receives; it
doesn't reach into tabs already open in someone's browser.

**Going forward: after deploying any admin-panel fix, hard-reload (or
close and reopen) any admin tabs before testing** — otherwise you may be
testing against code that's already out of date, even though the
deployment itself succeeded cleanly.

## Recovery
The Bike Rodeo event's images were re-inserted via Insert Media (files
were still present in Supabase Storage, so no re-upload was needed) and
resaved after the fix was deployed and the admin tab was reloaded. Other
content edited across multiple sessions/tabs during the affected period
should be spot-checked for the same issue.
