---
name: clinic-visit
description: Victoria's full clinical-chart workflow for prechart, consultations, follow-ups and performed procedures. Reads supplied records and the applicable HTML procedure entries, then verifies chart continuity, examination fidelity, targets, doses and format before delivering a draft. Includes corrections and focused review.
---

# Clinical chart workflow

## Read and route

Read repository-root `WORKFLOW-PREFERENCES.md`, or bundled `references/preferences.md`. That is the single policy source; do not recreate its rules here. Current patient-specific corrections override it.

For a version/status request, read `references/release.md` and report the release identifier together with actual resource/tool availability. A bundled release marker does not prove that an installed plugin was updated or that this host can execute its scripts.

- Prechart/new consultation: `references/workflow.md`.
- Returning patient/procedure encounter: `references/follow-up-workflow.md`.
- Examination assembly: `references/physical-exam.md`.
- Clickable examination review and assistant-populated HTML: `references/exam-workflow.md`. Use `scripts/render_exam.cjs` with source evidence; keep unresolved choices in review output and replace only EXAM for an exam-only correction.
- **Every performed procedure:** `references/procedure-workflow.md`, each applicable entry and shared logic in the current `procedure-note-builder.html` (bundled: `assets/procedure-note-builder.html`). Reading an earlier case's template or a memory summary does not satisfy this encounter's template step.
- Referral letters: use `referral-letter`; do not replace that skill.
- Procedure booking: `references/booking-workflow.md`. The assistant extracts facts from the actual sources and runs `scripts/render_booking.cjs`; Victoria does not fill forms. The renderer uses repository `booking-builder.html` or bundled `assets/booking-builder.html` and returns fixed wording for one or multiple appointments, explicit scheduling, conditional diagnostic-to-treatment plans and phenol logistics. Source interpretation remains the assistant's responsibility. No booking is transmitted. Do not claim the generator ran if only its source was read, and do not rewrite its final text through the LLM.

## Required execution sequence

1. Resolve the patient. Read available source files, not only previews. Inventory the prior full chart and current dictation/corrections. Keep explicit unresolved source conflicts visible for review.
2. Build on the previous chart. Retain its age and established background sections, medicines, investigations and historical examination. Update changed facts and today's plan. Do not substitute a shortened procedure-only summary unless requested.
3. For a procedure, load the actual HTML entries/shared logic and apply current case overrides. The HTML owns routine defaults; the preferences own output layout. Do not reproduce a successful procedure default when actual technical findings contradict it.
4. Draft once in the agreed layout. Use the supported regional exam wording. Keep the procedure narrative free of added standalone headings. The synthetic example in `references/procedure-example.md` demonstrates the layout, not universal doses or findings.
5. **Verify before delivery.** Apply `references/physical-exam.md` to every current or historical exam, including consultations and revisions. Match each supported component to its agreed wording and preserve specific abnormalities. When execution is available and the note contains examination findings, use the narrow verifier's source-linked `exam_findings` checks (`--exam-only` for a nonprocedure note; see `references/verifier.md`, or repository `scripts/PROCEDURE_VERIFIER.md`). Performed procedures still require the full procedure workflow and verifier; an exam-only pass cannot replace them. Fix flagged failures and rerun after changes. A pass is not independent clinical validation. Do not say review is complete if required sources or semantic review are missing.
6. Check booking instructions separately, including standalone MOA questions with no chart or examination. Read section 7 of the authoritative preferences and follow `references/booking-workflow.md`: extract facts and source evidence, apply supported defaults, resolve actual clinical choices, run the renderer, and return its successful output unchanged. No output is generated on validation failure. Review interpretation against the source even when mechanical checks pass. For the clinician-selected Tuesday/Wednesday anticoagulant examples, preserve BOTH complete branches as one unit. The renderer rejects that single-appointment schedule for a multiple-appointment sequence; obtain an individualized plan covering the sequence. `verify_booking_output.py` remains an additional wording-only check for the selected single-appointment template. If execution is unavailable, manually review and disclose that the generator was not run; do not describe an unchecked draft as verified.
7. Deliver one plain-text chart block and only the necessary external disclosure/review, billing screen or booking handoff. No internal manifests or checklists in the clinical note.

For a review-only request, return material findings and complete affected sections rather than an unsolicited full rewrite. For a previous note without encounter material, acknowledge readiness. For feedback, explain lessons first and save only agreed changes.

## Host limits

Verification is a required skill step, not a claim that the chat application technically blocks unverified replies. If execution is unavailable, perform a source-based manual review and disclose that the automated verifier was not run. If a required source is inaccessible, do not substitute an unrelated template or falsely claim it was read. Complete supported portions and identify the specific gap.

Local edits and bundles do not update an installed cloud plugin. Use `PUBLICATION.md` to verify delivery status; do not claim account-wide publication without evidence.
