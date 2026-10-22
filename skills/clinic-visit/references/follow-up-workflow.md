---
name: "follow-up-visit"
description: "Victoria's follow-up visit note: take her previous Accuro note plus Wispr Flow dictation of the follow-up, update procedures, interim history, exam, impression and plan, then review."
---

# Follow-up visit (Part I: updated note, Part II: review)

Current shared preferences and SKILL.md take precedence over legacy macros below. Read the October 21, 2026 refinements before drafting; use the HTML for procedure defaults.

Inputs: (1) the previous note for this patient (a consult note or an earlier follow-up note), pasted; (2) her Wispr Flow dictation of the follow-up encounter. Part I is the finished follow-up note she pastes into Accuro: the previous note carried forward, with the follow-up worked in. Part II reviews it as a second set of eyes.

If she pastes a finished follow-up note with no dictation and asks for review, run Part II only. If only the previous note arrives, wait for the dictation (one line: "Ready for the follow-up dictation."). If the mode is unclear, ask in one line.

**Goal: as little typing as possible.** Anything only she knows goes into the note as a click-through Accuro pick-list at the exact spot. Don't ask in chat what a pick-list can carry.

## Realistic standard

A follow-up is a short visit. Document what happened and what was decided. Never pad, never ask for exam elements or tests that weren't needed or done. Add a pick-list only when the note would be wrong, contradictory, unsafe or indefensible without it. Coherence is the exception to leniency: a note that doesn't hold together is a defect even if every fact is true.

## Output layout (strict)

1. If the note has pick-lists, first line outside any block: `Pick-lists: N. Search [null before pasting.` (N = spots, not lists; omit if 0.)
2. **Part I: the note.** One plain-text code block, the whole note, nothing else inside it. No markdown, bold, italics or asterisks.
3. **Judgment calls:** at most four short lines: (a) a source fact dropped, corrected or reinterpreted; (b) what was condensed or rewritten in carried-forward text; (c) which standing macros filled in undictated text; (d) which whole pick-lines to delete if the element wasn't done. Omit if none.
4. Anything else she asked for in the same request (referral letter, requisition wording) in its own code block. Referral letters follow the referral-letter skill.
5. Horizontal rule, then `## REVIEW (not part of the note, do not paste into Accuro)`, then Part II.
6. More material arrives: reissue the whole note and re-run Part II.

Do not add a salutation or invented signature. Preserve supplied CC recipients when requested or included in the source note.

## What changes and what carries forward

The previous note is the base. Apply the current section order: PAIN HISTORY, INTERIM HISTORY, previous/current examination, IMPRESSION, PROCEDURE NOTE if applicable, then PLAN. Update pertinent background rather than copying stale facts.

### Updated every time

1. **Opening line.** Use "I had the pleasure of following up with this pleasant [age]-year-old [male/female] with [chief complaint]." Add a separate sentence stating modality and actual visit purpose.
2. **PREVIOUS PAIN PROCEDURES.** Append each procedure done since the last note, chronological, one line each: date, modality, procedure, side/level, operator if not her, then response in brackets. Response format: `(% relief, duration, functional gain)`, e.g. `Oct 2026 US guided Rt SASD bursa + suprascapular nerve block (70% x 6 wk, back to overhead work)`. For a diagnostic local-anesthetic block, response is relief within the anesthetic window, e.g. `(85% at 1-6 h, pain diary)`. Missing response elements she has, and that the impression or plan depends on, get pick-lists: `[null|<30%|30-50%|50-80%|>80%]`, `[null|___ wk|ongoing]`. Each procedure listed once; earlier entries stay as written.
3. **INTERIM HISTORY** (separate section after PAIN HISTORY). Prose, in this order: response to what was done since last visit (procedure response written in words once here, numbers sit in PREVIOUS PAIN PROCEDURES; don't restate both in full), current pain and function versus last visit, progress on the non-procedural plan (physio/HEP, medication changes and tolerance, self-management), new or changed symptoms, red flags if dictated or pertinent. Keep today's procedural findings and immediate response out of INTERIM HISTORY; put them in a separate paragraph of IMPRESSION and in PROCEDURE NOTE. Every sentence must bear on today's impression or plan.
4. **EXAM.** Preserve useful historical findings under Previous EXAM with the date when known. Document newly supplied focused findings separately under EXAM; do not imply a full examination was repeated. Use EXAM virtual follow up for a telephone encounter. Read physical-exam.md for supported regional notation and explicitly invoked normal macros.
5. **IMPRESSION.** Rewritten from her dictation. Order: (1) "[age]-year-old [sex] with..." each complaint and its generator, updated by what the interim response showed (e.g. diagnostic block positive supports facet-mediated pain; no response to SASD argues against bursal source); (2) the response read against the stated target (>50% relief and/or functional gain lasting >=3 months for therapeutic; her stated threshold for diagnostic); (3) next step and why, including why repeat vs escalate vs change target vs stop; (4) contingency she stated; (5) multimodal frame: what continues and what the procedure is meant to enable. Address the referrer as "you" where about them. Reasoning only from her dictation; where it's thinner than what she clearly concluded, offer a pick-list or raise it in Part II.
6. **PLAN.** Replaced, not appended. Bullets, modality-prefixed: `- US guided: ...`, `- Fluoro: ...`, then non-procedural items, then follow-up (default "Follow up at procedure." when one is booked). Items that are done or abandoned drop off.

Whenever a new or repeat procedure is planned, the consent and counselling macros follow the impression (below). Include even if she only says "discussed risks".

### Carried forward

Carry forward pertinent background. Convert the initial HPI to PAIN HISTORY, summarizing onset, distribution, provoking/relieving factors and baseline functional limitation. Apply these updates:
- **Dictated changes go in:** a medication started, stopped or changed (dose), new imaging or labs, new diagnosis, allergy. Update the section and make sure the plan and interim history agree with it. Never drop a drug silently; if the dictation implies a stop but doesn't say it, pick-list it.
- **Finesse:** fix typos, dictation artifacts, contradictions and duplication. Don't rephrase sound text for style.
- **Anti-snowball rule:** if the previous note was itself a follow-up, its INTERIM HISTORY may be condensed into PAIN HISTORY where relevant as one or two condensed sentences (what was tried, response, what changed), and the procedure detail lives only in PREVIOUS PAIN PROCEDURES. Only today's INTERIM HISTORY stays as its own section. Report the condensing in Judgment calls.
- If she asks to rewrite or condense any carried section, return the whole section.

## Pick-lists

Syntax: `[null|option a|option b]`. null first, always. Multi-select allowed, so options can combine. Options are likely answers ready to paste as text; at most one `___` as a last resort. Several independent facts on a line = several lists. Place the list where the answer would be written. Whole-line pick-lines for an exam element she may not have done; tell her in Judgment calls to delete the line if not done. Never a "not done" option that leaves text behind. Never fabricate to fill one; never resolve a conflict silently.

Triggers (only these):
- procedure response the plan depends on but not quantified (repeat steroid, progression to RFA, abandoning a target);
- conflict between the previous note and the dictation on side, level, drug, dose or procedure, not clearly meant as a correction (options: each version);
- anticoagulant or DAPT on the med list with a neuraxial, deep or high-bleed-risk procedure planned and no plan dictated (low-dose ASA alone never triggers);
- a meaning-bearing transcription ambiguity (side, level, dose, negation, drug, procedure name);
- medication change implied but not stated;
- advanced imaging in the plan without the reason on the page;
- a Part II finding whose fix is information only she has.

## Dictation source (Wispr Flow)

Expect sound-alikes (drugs, anatomy, tests: PACE, FAIR, FADDIR), garbled levels ("L4-2" for L4-5, "see 5"), laterality ("write"), negation ("know"), numbers ("for"/4, "to"/2), spoken commands ("scratch that", "period"), fillers. Fix silently what context makes unambiguous. Never silently change side, level, dose, number, grade, a drug that could be another real drug, a procedure name or a negation: pick-list both readings, or write the reading context strongly favours and note it in Judgment calls. A dictated side/level that contradicts the previous note without being framed as a correction is a pick-list, not an overwrite. Self-corrections mid-dictation: last version stands. Never invent text to repair a garbled sentence.

## Source of truth

1. Today's dictation wins over the previous note, subject to the cross-check above.
2. Imaging and prior consult reports stay as the previous note reproduced them; add new reports she gives, don't re-summarize old ones.
3. Nothing added that isn't in the material, except the standing macros.
4. Her own edits to a section stand; fix only truncation, garbling and contradiction. What she trims stays trimmed next time.

## Standing macros

1. **Consent paragraph** whenever a procedure is planned (adapt procedure name; steroid sentence only if steroid is in the injectate; if implied but not stated, include and say so in Judgment calls):

```
I discussed the goals, risks and benefits of the [procedure]. The intent of the procedure is both diagnostic and therapeutic. We aim for >50% pain relief and/or functional improvement lasting ≥3 months. Common risks include lack of effect, or injection-site soreness lasting 5-7 days. Rare but serious risks include infection, bleeding, injury to adjacent artery, nerve, or other critical structure, and allergic/adverse reaction to medication. Risks specific to corticosteroid include transient facial flushing, transient hyperglycemia (particularly if diabetic), transient insomnia or mood change, and, with repeated or frequent dosing, adrenal suppression, immunosuppression, or local tissue/bone effects (e.g., avascular necrosis, epidural lipomatosis).
```

- Nociplastic pain or sensitization in the impression: add after the common-risks sentence, "In the setting of nociplastic pain, there is also a risk of nocebo response or migratory pain."
- Procedure-specific rare risks: SI joint, leg weakness from spread to the lumbosacral plexus; ischial bursa, sciatic spread with leg weakness, foot drop, falls risk; ilioinguinal/iliohypogastric or QL3 anterior, femoral/quadriceps weakness; thoracic/cervicothoracic targets near pleura, pneumothorax (never lumbar/gluteal).
- Diagnostic-only block: "The intent of the procedure is diagnostic"; drop the ≥3 month target and the steroid sentence.
- RFA: replace the target sentence with "We aim for >50% pain relief and/or functional improvement lasting ≥6 months." and add to rare risks: "neuritis or dysesthesia, skin burn, and motor nerve injury." No steroid sentence unless steroid is added.
- Short anticoagulant hold she chose: add that increased bleeding risk was discussed and the patient elected to proceed.

2. **Counselling paragraph** (fixed). If the patient hasn't agreed to proceed, end with `[null|Patient understood and agreed to proceed if symptoms persist.|Patient understood and would like time to consider before proceeding.]`:

```
I counselled that pain can be referred from another source and that injections are not guaranteed to provide complete relief; success by our standards would be meaningful reduction in pain and improved function. Patient understood and agreed to proceed.
```

3. **Low back pain red-flag negatives:** carry forward from the previous note; don't re-add to INTERIM HISTORY unless she dictates a change.

4. **DOAC hold advice** when date not set: Tuesday procedure, last dose Saturday; Wednesday, last dose Sunday; restart the day after if no issues. Antiplatelet and CKD adjustments are her call.

## Coherence pass (every time, silent)

Read top to bottom as the referrer would. Sides, levels, dates, doses and drug names agree across every section, including carried-forward text versus today's. Procedure list, interim history and impression tell the same story about response. Plan matches impression; nothing in one and not the other. No stale items: a plan bullet already done, a medication stopped but still listed, an old exam presented as today's. No leftover pick-lists from the previous note.

## Part II: review (automatic, every time)

Same rules as NOTE REVIEW mode. Calibrated to a short follow-up, not an ideal workup. Maximum five findings. No style or grammar.

Scope, in priority order:
1. **Response documentation supports the next step.** Is the response to the last procedure on the page in measurable terms (% relief, duration, function) and does it meet the threshold the next step needs? Repeat therapeutic injection: prior benefit >50% and/or functional gain for a clinically meaningful duration. RFA: positive diagnostic block(s) at the threshold she uses, with the block parameters on the page. Escalation after failure: the failure stated and why the new target is better.
2. **Changed reasoning reflected.** If the response changed the likely generator (positive or negative block), does the impression say so, and does the differential still match the exam?
3. **Coherence** between carried-forward and new sections (see coherence pass), and between impression and plan.
4. **Steroid exposure.** Frequency and cumulative dose across procedures in PREVIOUS PAIN PROCEDURES (interval, number of steroid injections in 12 months, diabetes/immunosuppression), only when it bears on what's planned.
5. **Multimodal frame.** Is progress on the non-procedural plan documented, and what the procedure is meant to enable? A note that reads as injection, response, repeat injection is a defensibility gap.
6. **Imaging/referral.** Advanced imaging or referral added at follow-up needs threshold, change if positive, change if negative, and for operative findings whether the surgical service would intervene. Say if XR, US, exam or a diagnostic block answers it instead.
7. **Safety:** anticoagulation (ASA alone never), allergy, new red flags or deficits since last visit.
8. **End point.** After repeated procedures with diminishing response, or at goal, is there a stated plan for when to stop, space out, or discharge back to the referrer?

Each finding: anchor (section + opening words); fix as a pick-list already in the note (one line saying where) or a drop-in replacement in a code block in her voice, replacing only what changes; one line of why naming the discriminating fact or test. Number by consequence. Then `Pattern:` lines only for habits that recur in this note or she's said recur. "apply" or "apply 1,3" reissues the whole note with those fixes and re-runs Part II. If nothing meets threshold: "Review: nothing meets threshold." Don't manufacture findings, don't soften real ones, hold position when pushed back on without good evidence.
