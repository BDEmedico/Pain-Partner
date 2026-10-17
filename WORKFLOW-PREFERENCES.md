# Approved Pain Partner preferences

These user-approved preferences take precedence over older bundled skill/reference wording. GitHub persistence is separate from cloud-plugin publication.

## Procedure-day billing review

Source: user-provided October 1, 2026 Saskatchewan payment-schedule excerpts, Section H Nerve Blocks 94H–158H and Section D 5D. Source URL: https://publications.saskatchewan.ca/api/v1/products/129078/formats/157436/download . This is excerpt-based screening, not verification of all payer, specialty or virtual-care requirements.

- Default encounter date to the client message date in America/Regina unless Victoria gives a different service date. Keep service date separate from drafting date and flag conflicts.
- For applicable procedure encounters, identify the latest known visit service by the same physician for the same or related condition and calculate elapsed calendar days. A procedure date alone does not establish a visit service; include known intervening visits. Unknown history means eligibility cannot be determined.
- Conservative user-selected boundary: days 0–30 are within the window, day 31 is outside. This boundary convention is not a separate payer confirmation.
- The excerpt states that a visit is not payable on the procedure day if a visit service was provided in the preceding 30 days for the same/related condition by the same physician. It also describes medically required assessments for a new condition, significant change in an existing condition, or necessary reassessment at a specific interval. Within 30 days, flag a possible documented exception for review rather than assuming its precedence or automatic eligibility.
- Routine consent, site/indication verification, procedure explanation, patient preparation and supply coordination are included in the procedure fee, even after 30 days.
- 5D lists history review, presenting complaint, functional enquiry, examination of affected parts/systems, diagnosis, assessment, necessary treatment, advice and record of service. Historical examination does not establish today's examination. Do not fabricate care or documentation to support a claim.
- Place a short Billing review — 5D line OUTSIDE applicable procedure notes: service date, previous relevant visit, elapsed days, separate medical necessity and remaining requirements. Never automatically say bill 5D on day 31.
- Do not automatically extend the displayed 94H–158H rule to peripheral joint/bursa codes, or infer telephone/virtual eligibility from this excerpt.

## Calibrated clinical review

- Flag material risks and distinguish missing documentation from demonstrated unsafe care. Consider chronology, progression, function, current findings, imaging and access to care. Distinguish emergency assessment, expedited outpatient review and routine clarification.
- State the decisive unknown and what would change the recommendation. Chronic stable symptoms alone do not exclude pathology. Revise recommendations when new facts warrant it; do not change them solely because of disagreement.
- Keep review concise and outside the letter. Do not invent reassuring findings or completed counselling. Avoid redundant diagnostic caveats when uncertainty is already expressed appropriately.


## Victoria's approved procedure-builder drafting workflow

This explicit user preference supersedes earlier instructions requiring individual confirmation pick-lists for every undictated builder detail.

- Authoritative source: repository-root `procedure-note-builder.html`, kept as a separate editable HTML file. The portable skill bundle includes a generated identical copy at `assets/procedure-note-builder.html` under the clinical-note skill; do not edit that generated copy independently. Use the provider's resource reader for cloud resources and local file access for workspace files. Read the relevant entries and shared generation logic each time; do not recreate anatomical wording from memory or substitute another procedure.
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
- Clinical letters contain patient information and clinical decisions, not commentary about the drafting process. Put missing-source observations such as "The dose and timing were not specified in this update" and "The MRI has not been confirmed in the material available today" in Review addressed to Victoria, OUTSIDE the copyable letter.
- Resolve the recipient from the referring physician in CC, even when the family physician field is blank. For a letter to Dr. Asenjo, say "you" or "your" rather than "clarify with Dr. Asenjo". Never invent a plan to chase information simply because the supplied material is incomplete.
- SURGICAL HISTORY is one compact comma- or semicolon-separated line, preserving material dates and context.
- PREVIOUS PAIN MEDICATIONS is one compact line, grouping shared responses: "Baclofen, tizanidine and nortriptyline — ineffective / side effects." Preserve distinct responses when different.
- Keep medication use, antibiotic indication, allergies, anticoagulation and contrast screening in their dedicated sections rather than HPI unless directly relevant to explaining the presenting problem.
- Replace procedural "confirm exact targets and imaging modality before booking" prose with source-supported pre-populated [null|...] choices where a decision remains unresolved. Builder defaults apply when authorized and not contradicted. Do not invent treatment alternatives merely to populate a list.
- Avoid redundant diagnostic caveats when the impression already states uncertainty. "Findings raise concern for an intra-articular hip contribution" does not need "These findings do not establish that all of his back pain is hip-derived." Raise material limitations in Review instead.
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
