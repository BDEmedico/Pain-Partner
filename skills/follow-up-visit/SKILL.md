---
name: follow-up-visit
description: Draft Victoria's pain-clinic follow-up note from a previous Accuro note and current Wispr Flow dictation, with interim history, updated procedures, impression and plan, inline pick-lists and focused review. Also review finished follow-up notes. Use clinic-visit for new-patient consults.
---

# Follow-up visit

Read [references/workflow.md](references/workflow.md) before drafting or reviewing. It preserves Victoria's supplied Claude workflow. Apply the corrections below wherever that reference differs. This skill is self-contained for follow-up drafting and review.

## Output and scope

- Start every response with `[Surname] · consult note` for follow-up drafting or `[Surname] · review only` for review or waiting for material. Use `[Unspecified]` if no surname is supplied. The status is outside the note.
- Previous note only: say `Ready for the follow-up dictation.` after the status. Finished note plus a review request: review only. Do not mistake an old note supplied as source material for today's encounter.
- Return one complete plain-text note block, followed by the focused REVIEW section. Keep the reference's pick-list count line and brief Judgment calls. Reissue the whole note when encounter material or corrections arrive.
- Work from supplied or explicitly authorized material. Do not claim access to Accuro, eHealth, PACS or Wispr Flow. Drafting does not authorize EHR writes, orders, bookings, transmission of patient material or messages.
- Keep patients separate. If the source note needed for carry-forward is unavailable, request it rather than reconstructing it. No facts from another patient or an example may enter the note.

## Source fidelity and carry-forward

- Today's explicit correction wins. Preserve Victoria's edits, deletions and resolved choices. Meaning-bearing ambiguity or an unexplained side/level/dose conflict gets an inline `[null|...]` pick-list; do not silently resolve it. Write `unsure` for genuinely unknown facts instead of inventing likely answers.
- Carry historical sections forward as historical material. Never make an old examination, screening or consent statement appear to describe today's encounter. The reference's six updated elements supersede its erroneous phrase `Four sections`.
- Do not infer a generator, interpret a diagnostic response into a new diagnosis, add a treatment rationale or create a contingency on Victoria's behalf. Include her stated reasoning. A meaningful gap belongs in review; a pick-list can resolve a fact she knows, not solicit or invent her opinion.
- No default appointment, booking, discharge or follow-up plan. Include `Follow up at procedure.` only when supported by the dictated plan. Group plan bullets by clinical purpose, retaining US guided/Fluoro labels where useful.
- Use age from the previous note unless updated; do not calculate a new age without sufficient dated information. Avoid specialty labels after clinicians' names. Patient remains unnamed in the note; narrative is third person, clinician is `I`, referrer is `you`.
- MEDICAL HISTORY stays one compact comma-separated line. Correct only meaningful errors or dictated updates in carried text. Condense prior INTERIM HISTORY as the reference directs; do not restore previously trimmed material.

## Examination, macros and patient agreement

- No examination dictated: use the reference's whole-section confirmation pick-list. `Same exam` supports carrying the explicitly confirmed exam forward. Never supply normal motor/sensation findings independently at follow-up.
- Standing consent wording is a drafting template, not evidence that counselling or patient agreement occurred. If unconfirmed, put the proposed paragraph inside a null-first confirmation pick-list and identify it briefly in Judgment calls. Never assert increased bleeding risk was discussed or that the patient elected to proceed without confirmation.
- Use one compact consent-and-counselling paragraph when a procedure is planned. Do not duplicate detailed consent already provided in a procedure note; retain distinct counselling. Do not infer steroid in the injectate. Include steroid risks only when steroid use is established.
- For a mainly diagnostic block use `The intent is mainly diagnostic.` Omit the therapeutic duration target. If steroid is established, its risk sentence ends at `insomnia or mood change`. Omit the `not guaranteed` counselling closer for this block. Diagnostic response documentation concerns the anesthetic window, not a three-month target.
- Treat the reference's therapeutic and RFA benefit targets as Victoria's documentation conventions, not universal eligibility rules. Review against her stated patient-specific threshold; do not automatically reject a repeat procedure solely because benefit lasted less than three months.
- Prior low-back red-flag negatives remain historical; do not imply they were reassessed today unless supplied. Missing new safety information warrants a pick-list only when it materially affects today's plan.
- DOAC schedules in the reference are local clinician conventions. Reproduce when selected for this patient: Tuesday procedure, last dose Saturday, no doses starting Sunday; Wednesday procedure, last dose Sunday, no doses starting Monday; restart the next day if no issues. Antiplatelet and CKD adjustments remain Victoria's decision. Unselected anticoagulation management gets a pick-list, not an automatically prescribed hold. For a requested new clinical recommendation, verify current authoritative guidance outside the note.

## Review calibration

- Maximum five material findings. Flag misleading, indefensible or incoherent documentation that changes meaning or management; no stylistic edits, ideal-workup checklists or demands for facts nobody knows. Prefer `Review: nothing meets threshold.` when appropriate.
- Each finding has an anchor, copyable replacement and one line explaining the consequence. Return the entire affected section in one plain-text block, preserving sound wording. Combine fixes to the same section. Do not make Victoria assemble scattered snippets. Clinician-only factual decisions remain inline null-first pick-lists. If already addressed by a pick-list in Part I, point to that spot without duplicating it.
- Review whether response supports the next step and whether the intervention sits in the dictated multimodal plan. Do not create a new stop rule, referral, investigation or treatment plan to cure a documentation gap.
- Advanced imaging or referral requires the patient-specific threshold and concrete management changes if positive and negative. For operative findings, assess whether surgery would actually be offered. Raise a material omission in review rather than inventing rationale in the note. X-ray, ultrasound, examination or a diagnostic block may be alternatives in requested clinical reasoning, not unsolicited additions to the dictated plan.
- A separate requested referral letter uses the available referral-letter skill; if unavailable, follow Victoria's supplied format and keep the tone generous and collegial. Do not send it without separate authorization.

## Automatic referral-letter companion

When the supplied note identifies a first clinic visit or follow-up, select the corresponding visit workflow automatically. If Victoria states in her dictation or current note that she is sending/making a referral, also invoke the available referral-letter skill without requiring a separate request. A definite referral plan is sufficient; a historical referral or an option merely being considered is not.

Finish the visit note and focused review, and draft each requested referral as a separate labelled plain-text code block outside the Accuro note. Use the finalized note as source and preserve the stated recipient and clinical question. Do not invent missing indications or recipients. Flag an essential missing fact briefly outside the letter; omit nonessential missing details. Drafting the letter does not authorize sending it.

## Approved refinements: pick-lists, concise plans and final checks

These rules override conflicting instructions or examples in this skill and its workflow reference.

- Use fewer, better-placed pick-lists. Each list replaces a complete grammatical unit. Keep punctuation outside inline lists and avoid adjacent fragments that can produce garbled sentences.
- Separate independent examination findings. Example: `- Hip: Gluteal pain with FAIR. Log roll: [null|negative|positive]. FABER negative.` When the entire element may be omitted, put its label and finding inside a whole-line list: `[null|- Hip: Log roll negative.|- Hip: Log roll positive.]`. Null must remove that whole optional line cleanly. For an inline field, null may leave a clearly labelled empty field pending completion, never a dangling conjunction, negation or punctuation fragment.
- Silently substitute every option into each list, then select null, and check the resulting sentence or line for grammatical coherence. Positive and negative findings for one test are mutually exclusive; use multi-select only for compatible facts. If several facts require separate decisions, give each its own clearly labelled list rather than combining them.
- Brackets resolve clinician-known facts or meaning-bearing ambiguity. Do not invent diagnoses, imaging indications, management branches or the clinician's reasoning as selectable options. If a necessary rationale is absent, use a focused factual completion field or raise the material gap in review. Preserve genuinely unknown facts as unsure.
- IMPRESSION holds the clinician's reasoning, justification, counselling and relevant logistics. PLAN is a bare-bones action list for a quick glance: action, procedure modality, laterality, target/levels and essential timing only. Keep examination findings, rationale and referral-chasing instructions in the impression. Combine investigation and review timing where useful. The plan must agree with the impression without duplicating it.
- Do not restore deleted medication choices, rehabilitation suggestions, surgical stop-point bullets or redundant follow-up lines. Preserve the clinician's edits, resolved choices and deletions on every revision. Flag a material contradiction rather than silently reversing an edit.
- After a procedure changes, reconcile its name throughout impression, consent and plan. A clinician's change from trigger point injections to ESP blocks is a revised plan, not a transcription error; preserve it. Do not conflate ESP blocks with trigger point injections.
- When generic counselling is appropriate, use: `I counselled that interventional pain procedures are not guaranteed to provide relief and do not change the underlying anatomy. They are an adjunct to self-management of pain.` Preserve the mainly diagnostic exception. Add patient agreement only when supplied or confirmed; keep unconfirmed counselling subject to the existing confirmation rule.
- In feedback, return complete affected sections with factual uncertainties bracketed in place, combine changes to the same section, and keep the explanation brief. Before initial delivery, check for duplicate sections, unresolved negations, mismatched procedure names and contradiction between impression and plan.

## Account-wide availability of saved preferences

Victoria requires these workflows and approved preferences to be available from home and work through her ChatGPT cloud account. The canonical distribution is the personal Pain Partner cloud plugin: https://chatgpt.com/plugins/Plugin_fe83fb96b1bc8191b056547be75b96ec . Local filesystem changes alone do not satisfy a request to save or update a skill.

When Victoria authorizes a reusable skill/preference change, preserve the other bundled skills, update the existing cloud plugin as part of the same task, and verify the new version is available. Do not create duplicate plugins or public listings. Do not report a change as saved account-wide without verification. If cloud update access is unavailable, say clearly that the change is local/pending cloud publication and identify the precise blocker. Do not imply built-in automatic local/cloud synchronization.

For cloud work, use the installed plugin's skills; access to the work computer must not be a prerequisite. Clinical note edits alone do not trigger skill changes. This standing preference authorizes maintenance of this personal plugin when a skill change has been authorized, not transmission of patient charts or public sharing.


## Victoria's approved procedure-builder drafting workflow

This explicit user preference supersedes earlier instructions requiring individual confirmation pick-lists for every undictated builder detail.

- Authoritative source: /workspace/Pain-Partner/procedure-note-builder.html, the existing uploaded HTML until Victoria supplies a replacement. Read the relevant entries and shared generation logic each time; do not recreate anatomical wording from memory or substitute another procedure.
- Consult without a performed procedure: when Victoria specifies the planned procedure, use the builder's applicable general and procedure-specific consent wording. Victoria has explicitly confirmed she discusses these items even when omitted from dictation. Do not describe the procedure as performed.
- Procedure performed: populate the complete applicable builder template, including default targets/selections, positioning, guidance, needles, injectate, consent, screening, complications and disposition, for clinician review. Explicit patient-specific dictation and known facts always override defaults. Never insert a conflicting NKDA, anticoagulation status, injectate, laterality, steroid or outcome.
- Select the builder's default when an undictated setting has several options, rather than burdening the draft with numerous pick-lists. If no applicable default exists, or patient-specific sources conflict materially, use a focused pre-populated pick-list or flag the unresolved item outside the note.
- Identify undictated defaults together in one short line OUTSIDE the copyable note: "Builder defaults used for clinician review: ...". In particular distinguish template screening, absence of complications and discharge statements from dictated observations until reviewed. A draft is not a signed record. Do not claim that defaults have been independently verified.
- Preserve the distinction between intramuscular trigger point injections and ESP plane blocks; between GON, TON and LON; and between different dorsal scapular approaches. Match terminology, targets, guidance and doses throughout.
- Reconcile total volume and drug dose across all sites. When no dose was dictated, use the builder default, visibly noted outside the note. Never silently resolve a contradictory or implausible dictated dose by guessing.
- Whole-note coherence check applies to EVERY note: history, interval response, medical conditions, examination, investigations, impression and plan must fit. Flag material mismatches to Victoria outside the note. Suggest plausible alternative diagnoses or additional examination/history documentation that would support the plan, without fabricating findings or implying that undictated care occurred. Add concise diagnostic nuance to the impression only where clinically necessary, and avoid redundant caveats.
- Do not modify the separate physical-examination workflow as part of this change; Victoria deferred that discussion.
- Source reading/manual assembly is not a tested invocation of the generator. Do not claim exact generated output unless the generator was actually run. Record unavailable source or tooling plainly outside the note.

## Preserved correspondence preferences
- Opening clinical summary and modality are separate sentences: "I had the pleasure of following up with this pleasant ... . This was a phone appointment."
- Retain historical examination findings under "Previous EXAM"; use "EXAM virtual follow up" for the current virtual encounter.
- Keep missing-source commentary and drafting questions outside the letter. Use pre-populated [null|...] prompts for unresolved clinician-known facts, not administrative "confirm..." prose.
- Identify the referring physician from CC and address them as "you" warmly and collegially.
- Medical history, surgical history and previous pain medications are each compact single-line sections; group shared medication responses without losing distinctions.
- Previous pain procedures: date, abbreviated procedure — response, total corticosteroid drug/dose when known. Prefer rt, lt, bilat, GT, TPI, IA, SIJ, facet, MBB, SLBB, RF.
- Patient-directed follow-up wording when selected: "Patient-directed follow-up. If functionally limiting pain that's persistent returns before 3 months, we will arrange a phone reassessment to discuss alternatives. If >3 months, repeat bilateral L4/5 and L5/S1 facet injections." Adapt targets and intervals to the dictated plan; do not impose a universal schedule.
- Dr. Brose is a hematologist.


## Procedure formatting and aspiration clarification
- Place INVESTIGATIONS before PREVIOUS PAIN PROCEDURES. Keep interim history and examination near the bottom, followed by IMPRESSION, the procedure documentation, then PLAN.
- Procedure documentation sits under the impression; omit a separate "Diagnosis:" or "Procedure diagnosis:" line, since the diagnosis is already in the impression.
- Use cc for injectate volumes, retaining mg/mL for concentration. Write "methylprednisolone" rather than "methylprednisolone acetate" in routine injectate lines. Example: "4cc lidocaine 1% + 1cc methylprednisolone 40 mg/mL". Specify division across joints/sites for multiple targets; omit redundant allocation for one joint.
- Victoria confirms that allergies and antithrombotic use are checked even if not dictated. Populate the preprocedural screen from the patient-specific record unless newer information conflicts. Preserve builder checklist, procedure-specific consent risks and observation/discharge defaults for clinician review.
- Negative aspiration for blood before injecting is distinct from joint-fluid aspiration. The former is an injection safety check; the latter is a diagnostic/therapeutic procedure. Never infer "no blood aspirated" from "no joint aspiration" or vice versa.
- Approved ultrasound draft default: "Aspiration was negative for blood before injection at each site. Injectate spread at each target was visualized under real-time ultrasound." Keep ultrasound wording only for ultrasound-guided procedures. Preserve modality-specific contrast/vascular-uptake wording for fluoroscopic procedures.
- Negative blood aspiration does not exclude intravascular placement. Do not document that it proves no arterial or venous injection, or substitute it for appropriate imaging confirmation.
- Flag unclear, redundant or inaccurate builder wording to Victoria outside the note so the template can be improved; the builder is an evolving draft source.
