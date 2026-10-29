---
name: clinic-visit
description: Victoria's full clinical-chart workflow for prechart, consultations, follow-ups and performed procedures. Reads supplied records and the applicable HTML procedure entries, then verifies chart continuity, examination fidelity, targets, doses and format before delivering a draft. Includes corrections and focused review.
---

# Clinical chart workflow

## Read and route

Read repository-root `WORKFLOW-PREFERENCES.md`, or bundled `references/preferences.md`. That is the single policy source; do not recreate its rules here. Current patient-specific corrections override it.

- Prechart/new consultation: `references/workflow.md`.
- Returning patient/procedure encounter: `references/follow-up-workflow.md`.
- Examination assembly: `references/physical-exam.md`.
- **Every performed procedure:** `references/procedure-workflow.md`, each applicable entry and shared logic in the current `procedure-note-builder.html` (bundled: `assets/procedure-note-builder.html`). Reading an earlier case's template or a memory summary does not satisfy this encounter's template step.
- Referral letters: use `referral-letter`; do not replace that skill.

## Required execution sequence

1. Resolve the patient. Read available source files, not only previews. Inventory the prior full chart and current dictation/corrections. Keep explicit unresolved source conflicts visible for review.
2. Build on the previous chart. Retain its age and established background sections, medicines, investigations and historical examination. Update changed facts and today's plan. Do not substitute a shortened procedure-only summary unless requested.
3. For a procedure, load the actual HTML entries/shared logic and apply current case overrides. The HTML owns routine defaults; the preferences own output layout. Do not reproduce a successful procedure default when actual technical findings contradict it.
4. Draft once in the agreed layout. Use the supported regional exam wording. Keep the procedure narrative free of added standalone headings. The synthetic example in `references/procedure-example.md` demonstrates the layout, not universal doses or findings.
5. **Verify before delivery.** Follow the procedure workflow's source-based review and run the narrow verifier when execution is available. Fix only flagged failures and rerun after changes. A verifier pass is not independent clinical validation. Do not say review is complete if sources, template access or semantic review are missing.
6. Deliver one plain-text chart block and only the necessary external disclosure/review, billing screen or booking handoff. No internal manifests or checklists in the clinical note.

For a review-only request, return material findings and complete affected sections rather than an unsolicited full rewrite. For a previous note without encounter material, acknowledge readiness. For feedback, explain lessons first and save only agreed changes.

## Host limits

Verification is a required skill step, not a claim that the chat application technically blocks unverified replies. If execution is unavailable, perform a source-based manual review and disclose that the automated verifier was not run. If a required source is inaccessible, do not substitute an unrelated template or falsely claim it was read. Complete supported portions and identify the specific gap.

Local edits and bundles do not update an installed cloud plugin. Use `PUBLICATION.md` to verify delivery status; do not claim account-wide publication without evidence.
