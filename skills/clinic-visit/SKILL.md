---
name: clinic-visit
description: Victoria's unified clinical-note workflow for chart prep, new consultations, follow-ups, procedure encounters, corrections and review. Merge supplied records and encounter dictation into a concise Accuro draft and focused review. Use for both new and returning patients.
---

# Clinical notes — consults and follow-ups

One skill handles clinical documentation. Keep the existing `clinic-visit` identifier for continuity; a separate follow-up skill is no longer required. Referral letters remain in `referral-letter`. The HTML procedure builder remains independently editable.

## Read first and precedence

1. Read repository-root `WORKFLOW-PREFERENCES.md`, or bundled `references/preferences.md` in a portable/cloud package. Use the provider reader for provider resources; do not assume filesystem paths.
2. For chart prep, new consults and general structure, read `references/workflow.md`.
3. For returning patients, also read `references/follow-up-workflow.md` for carry-forward and response tracking.
4. For procedures, read the selected entries and shared generation logic in repository-root `procedure-note-builder.html`, or bundled `assets/procedure-note-builder.html`. Do not claim the generator ran when only its source was read.

Current patient-specific facts and Victoria's corrections take precedence, followed by shared preferences and this skill. Older reference instructions apply only where consistent. Older vertical history lists, extensive confirmation prose, third-person addressing of the referrer or removal of historical examinations do not override the approved preferences.

Read `references/physical-exam.md` when assembling or reviewing examinations. It contains the agreed normal macros and multi-select prompts and overrides older examination-template instructions.

## Select the mode

- Chart prep: organize supplied records and automatically add a separate focused clinical review for Victoria: prioritized differential, discriminating exam/history, and actionable safety or clarification flags relevant to the pain encounter. This overrides older extraction-only instructions. Keep hypotheses and suggested assessments outside the factual chart block. Do not fabricate a current exam or final treatment decision.
- New consult: merge the encounter with supplied records into a complete note.
- Follow-up: carry forward pertinent background; update procedures/responses, interim history, impression and plan. Preserve historical findings under `Previous EXAM`; use `EXAM virtual follow up` for today's virtual visit. Historical negatives must not appear newly reassessed.
- In follow-ups, use separate PAIN HISTORY (baseline and functional limitations), INTERIM HISTORY (interval course and decision), and examination sections. Today's technical findings and immediate procedural response go in a separate paragraph of IMPRESSION and in PROCEDURE NOTE, not INTERIM HISTORY.
- Procedure: place the builder draft beneath IMPRESSION, without a duplicate diagnosis line. Do not present planned treatment as performed unless explicitly requested as a post-procedure draft for clinician review.
- Review only: give material findings and complete replacement sections, not an unsolicited whole-note rewrite.
- Previous note without an update: acknowledge readiness for encounter dictation.

## Drafting

- Accept Heidi-generated notes or raw transcripts plus Victoria's brief final summary. Clearly distinguish these sources, preserve her corrections and decisions, and flag material discrepancies. A generated note is not a verified transcript and generic AI normal-exam prose does not invoke her normal macro. Follow the shared preferences for relevance-focused pre-chart review and transcript handling.
- Keep patients separate. Use supplied or authorized sources. Drafting implies no EHR access, orders, booking, prescription transmission or letter sending.
- Use a surname/status line outside the note. Do not add unnecessary identifiers. Missing information goes in Review or a focused pre-populated `[null|option|option]` field, not narrative commentary about the drafting process.
- Keep the chief complaint in the opening sentence: `I had the pleasure of following up with this pleasant ... with [chief complaint].` Follow with `This was a [phone/in-person] follow-up to [purpose].` Infer the purpose when clear from the encounter. Otherwise insert a tailored clickable purpose list, never a blank or invented billing justification. Follow the shared preferences for current focused examination, functional outcomes and explicit follow-up ownership.
- Medical history, surgical history and previous medications are compact single-line sections. INVESTIGATIONS precedes PREVIOUS PAIN PROCEDURES. Near the end: interim history, previous/current exam, impression, procedure if applicable, plan.
- Prior procedures: date, abbreviated procedure — response, duration/function, total steroid drug/dose when known. Never infer unknown doses.
- Use the referring physician's name in HPI and `you/your` in IMPRESSION and PLAN, resolving the recipient from CC. Keep the tone warm, appreciative, professional and collegial. Keep HPI focused on pain; medications and safety screening have dedicated sections.
- Spell out `left` and `right` in IMPRESSION and PLAN; lt/rt remain appropriate in the previous procedure list. When that is the actual plan, use `Fluoro: bilateral S1 TFESIs, left first.` Preserve bilateral intent rather than replacing it with `staged`; do not apply this example as a default treatment.
- Do not invent exam findings, reassuring negatives, clinical reasoning or outcomes. For the authorized procedure template, populate defaults and identify them together outside the note for review. Known facts override defaults; a template is not independently verified evidence of completed care.
- Reconcile targets, laterality, procedure, guidance, needles, drugs, concentrations, volumes and total doses. Keep blood aspiration separate from joint-fluid aspiration. Flag contradictory or implausible doses rather than guessing.
- Use TFESI in procedure titles. Format injectate as compact target-specific bullets with volume, concentration and division across sites, with contrast on its own line. Use methylprednisolone rather than brand shorthand and omit redundant total-steroid-dose bullets while still checking total exposure.
- Record technical limitations, attempted adjustments and the supplied rationale for the final position. Distinguish an aborted target from a completed block and document procedural events rather than defaulting to no complications. Preserve uncertain retrospective level identification as uncertain. Do not carry exact prior contrast spread forward as a new finding.
- For combined steroid-only epidural delivery followed by a nerve root block, use the HTML `lumbar_root_sequence` entry, one side/root per card. Keep initial contrast, steroid-only delivery, needle withdrawal, repeat contrast and periradicular local anesthetic in order. Separate drug and contrast phases; do not substitute the standard TFESI flush or add steroid to a local-anesthetic-only root block. Use compact level-specific paragraphs without standalone level subheadings, omit the redundant no-flush sentence, and follow the latest spread wording in shared preferences.
- Use a reasoned, concise impression without redundant caveats. PLAN contains actual decisions, not assistant-generated administrative tasks. Default to one compact line, e.g. `- Fluoro: right S1 TFESI, bilateral L5/S1 facets.` Use separate unbulleted procedure lines beneath `- Fluoro:` only for particularly complex plans or when requested. Keep conditional injectate wording on its procedure line. Follow the shared preferences for spacing and avoid duplicating logistics.
- Preserve Victoria's own virtual response review when dictated, followed by a reminder to book with the referring physician. Do not substitute automatic discharge or referring-provider-only follow-up from older reference macros.
- A definite new referral plan triggers a companion letter using `referral-letter`. Do not send it. Historical or conditional referrals do not trigger new correspondence.

## Review and billing

Check history, response, exam, imaging, impression and plan for agreement. Flag material mismatches outside the letter; suggest differential diagnoses or missing clinician-known facts where useful without inventing support. Apply calibrated urgency according to progression, severity and evidence. Maximum five meaningful findings; no manufactured issues.

On applicable procedure encounters, append the shared preferences' 5D billing screen outside the note. Use the actual service date or client date in America/Regina, not server UTC. Unknown intervening visits or code scope prevent definitive eligibility claims. Day 31 is not automatic billing eligibility.

## Delivery and publication

Provide one complete plain-text note block, or complete affected sections for review corrections. Review, billing checks and default disclosures stay outside it.

GitHub updates do not publish the installed cloud plugin. Update the existing personal plugin when publishing tools exist, preserving referral capability and the HTML resource. Otherwise prepare a portable bundle and clearly state the missing publication capability; do not claim account-wide availability.
