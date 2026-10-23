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

## Feedback and authorized procedure defaults

- Final-note feedback starts a learning discussion: explain the inferred lessons first, refine them collaboratively, and save only after Victoria agrees what should be retained. Do not automatically update skills or push solely because feedback was supplied.
- Always rely on the current HTML for performed procedure notes: read the applicable entry and shared logic and populate the complete authorized defaults. The HTML is the intended standardization tool, designed to avoid repeated dictation. Victoria supplies variations and exceptions.
- Patient-specific facts and procedural events override defaults. Use one concise disclosure below the copyable note identifying defaults used; do not burden the note with repeated confirmation questions or placeholders for authorized defaults. Clarify only material conflicts or details for which there is no applicable default. Defaults are clinician-review draft content, not independently verified observations.
- Check HTML completeness and preservation of dictated exceptions before delivery. Do not use an unrelated template when no applicable entry exists; flag actual safety or consistency problems separately.

## Select the mode

- Chart prep: organize supplied records and automatically add a separate focused clinical review for Victoria: prioritized differential, discriminating exam/history, and actionable safety or clarification flags relevant to the pain encounter. This overrides older extraction-only instructions. Keep hypotheses and suggested assessments outside the factual chart block. Do not fabricate a current exam or final treatment decision.
- New consult: merge the encounter with supplied records into a complete note.
- Follow-up: carry forward pertinent background; update procedures/responses, interim history, impression and plan. Preserve historical findings under `Previous EXAM`; use `EXAM virtual follow up` for today's virtual visit. Historical negatives must not appear newly reassessed.
- In follow-ups, use separate PAIN HISTORY (baseline and functional limitations), INTERIM HISTORY (interval course and decision), and examination sections. Today's technical findings and immediate procedural response go in a separate paragraph of IMPRESSION and in PROCEDURE NOTE, not INTERIM HISTORY.
- Procedure: place the builder draft beneath IMPRESSION, without a duplicate diagnosis line. Do not present planned treatment as performed unless explicitly requested as a post-procedure draft for clinician review.
- Review only: give material findings and complete replacement sections, not an unsolicited whole-note rewrite.
- Previous note without an update: acknowledge readiness for encounter dictation.

## Drafting

- Initial telephone consultations: after the patient-specific thank-you opening, use "This consultation was conducted by telephone to improve patient access, assess symptoms and discuss interventional options." Always retain "to improve patient access" for this visit type. Follow-ups retain their own modality/purpose opening.
- CURRENT MEDICATIONS must be an inline paragraph after the colon, not a vertical bullet list, unless explicitly requested. Retain supported doses/frequencies; keep unresolved discrepancies in the separate review or a focused bracketed choice rather than silently selecting a conflicting dose.

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

## Final consistency check

- Apply final-note refinements: use `Referral exam` for the referrer's historical examination, compact XR labels, and a concise actionable plan. Avoid duplicating HPI negatives in the impression or inserting unsolicited appreciation paragraphs. Confirmed procedure terminology and laterality in the clinician's final edits override earlier ambiguous dictation; preserve those facts without turning patient-specific choices into defaults.

- Keep the copyable note free of assistant/editorial comments such as "current use requires reconciliation". Place unresolved medication use and missing information in the review below the note, or use a focused bracketed choice such as `[taking|discontinued]` when an embedded clarification is useful. Never imply plain text guarantees clickable controls. Preserve clinically material uncertainty without inventing facts.
- For explicitly supplied normal lower limb findings or invoked shorthand, consistently use `Motor: L2–S1 5/5 bilaterally.` and `Sensation: L2–S1 intact to light touch bilaterally.` Apply Victoria's explicit corrections before transcript wording, and retain specific abnormalities. Missing or partial findings do not authorize a full normal macro.
- Before delivering, verify motor, sensation and reflexes against the supplied examination, preserve gait/function and abnormal exceptions, and move drafting comments outside the copyable note.

## Review and billing

Check history, response, exam, imaging, impression and plan for agreement. Flag material mismatches outside the letter; suggest differential diagnoses or missing clinician-known facts where useful without inventing support. Apply calibrated urgency according to progression, severity and evidence. Maximum five meaningful findings; no manufactured issues.

On applicable procedure encounters, append the shared preferences' 5D billing screen outside the note. Use the actual service date or client date in America/Regina, not server UTC. Unknown intervening visits or code scope prevent definitive eligibility claims. Day 31 is not automatic billing eligibility.

## Delivery and publication

Provide one complete plain-text note block, or complete affected sections for review corrections. Review, billing checks and default disclosures stay outside it.

For phone visits with a definite procedure-booking decision, append the separate six-field booking block defined in shared preferences: Procedure, Duration, Anticoagulation, Antiplatelets, Steroid and Ativan. Default duration is 30 minutes; absent Ativan preference is "please ask patient". Begin with `Please book:` and a blank line; omit an MOA task heading, contact information, timing and additional details. Format Procedure with guidance first, then uppercase confirmed laterality and the abbreviated procedure/target, e.g. `Fluoro, RIGHT S1 TFESI`; this is a formatting example, not a target default. Use `Duration: 30 minutes`, not `Booking duration:`. Use polite `please confirm current status` for historical screening and keep Steroid to Yes/No when established. Follow the latest shared booking wording; never infer negative antiplatelet status from a screen excluding ASA. Preserve documented medication management (including ASA under antiplatelets) without inventing holds. Do not generate a booking task for merely conditional treatment or send it automatically.

GitHub updates do not publish the installed cloud plugin. Update the existing personal plugin when publishing tools exist, preserving referral capability and the HTML resource. Otherwise prepare a portable bundle and clearly state the missing publication capability; do not claim account-wide availability.


## Booking quality check
Preserve clinician-confirmed decisions and name explicit alternative targets with their agreed decision timing. Separate deliberate day-of-procedure localization from genuinely missing facts. Avoid repetitive confirmation clauses after the clinician has settled screening or injectate. Use `Ativan: Please ask` for an unknown preference; this is not medication authorization, and explicit restrictions still apply. Keep clarification flags outside the scheduling block unless needed to schedule. Apply shared preferences for calibrated uncertainty and concrete functional outcomes.


## Phenol booking exception
For phenol procedures, append the shared preferences' special logistics after the six-field booking block: appointment after 11 a.m.; no Tuesday immediately after a long weekend; notify Dr. Tian once the date is set so she can send the prescription to Medicine Shoppe on Baltzan. Include the MOA request in the prose paragraph below, without a separate task heading or bullets. These requested logistics override the default omission of additional booking details. Drafting is not actual task assignment or prescription transmission.


### Approved phenol handoff wording
After the standard six-field booking block, append these two paragraphs (adapt patient pronouns only as needed):

Once you have a date, let me know. I'll need to send the prescription to Medicine Shoppe on Baltzan.

Please task an MOA to take the phenol out of the fridge early on the morning of the procedure. Please book her later in the day (after 11 a.m.) so the phenol has time to warm. Please don't book on a Tuesday after a long weekend.

Preserve this natural prose and direct first-person wording. Do not add logistics headings or convert it to a list. This supersedes earlier separate-task formatting.
