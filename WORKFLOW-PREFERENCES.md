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
- Physical-examination preferences have now been agreed in `skills/clinic-visit/references/physical-exam.md`. Use those macros and prompts, with specific dictated findings overriding invoked normal findings.
- Source reading/manual assembly is not a tested invocation of the generator. Do not claim exact generated output unless the generator was actually run. Record unavailable source or tooling plainly outside the note.

## Preserved correspondence preferences
- Clinical letters contain patient information and clinical decisions, not commentary about the drafting process. Put missing-source observations such as "The dose and timing were not specified in this update" and "The MRI has not been confirmed in the material available today" in Review addressed to Victoria, OUTSIDE the copyable letter.
- Resolve the recipient from the referring physician in CC, even when the family physician field is blank. Use the referring physician's name in HPI; use "you" or "your" in IMPRESSION and PLAN. Keep the tone warm, appreciative, professional and collegial. Never invent a plan to chase information simply because the supplied material is incomplete.
- SURGICAL HISTORY is one compact comma- or semicolon-separated line, preserving material dates and context.
- PREVIOUS PAIN MEDICATIONS is one compact line, grouping shared responses: "Baclofen, tizanidine and nortriptyline — ineffective / side effects." Preserve distinct responses when different.
- Keep medication use, antibiotic indication, allergies, anticoagulation and contrast screening in their dedicated sections rather than HPI unless directly relevant to explaining the presenting problem.
- Replace procedural "confirm exact targets and imaging modality before booking" prose with source-supported pre-populated [null|...] choices where a decision remains unresolved. Builder defaults apply when authorized and not contradicted. Do not invent treatment alternatives merely to populate a list.
- Avoid redundant diagnostic caveats when the impression already states uncertainty. "Findings raise concern for an intra-articular hip contribution" does not need "These findings do not establish that all of his back pain is hip-derived." Raise material limitations in Review instead.
- Opening clinical summary and visit modality/purpose are separate sentences. Preserve the chief complaint: "I had the pleasure of following up with this pleasant [age]-year-old [male/female] with [chief complaint]. This was a [phone/in-person] follow-up to [purpose]."
- Retain historical examination findings under "Previous EXAM"; use "EXAM virtual follow up" for the current virtual encounter.
- Keep missing-source commentary and drafting questions outside the letter. Use pre-populated [null|...] prompts for unresolved clinician-known facts, not administrative "confirm..." prose.
- Apply the section-specific addressing rule above: physician name in HPI, "you/your" in IMPRESSION and PLAN.
- Medical history, surgical history and previous pain medications are each compact single-line sections; group shared medication responses without losing distinctions.
- Write "left" and "right" in full in IMPRESSION and PLAN; retain lt/rt shorthand in PREVIOUS PAIN PROCEDURES.
- When bilateral S1 TFESIs with the left side first are the actual plan, use: "Fluoro: bilateral S1 TFESIs, left first." Do not substitute "staged" for "bilateral" or infer bilateral treatment for other patients.
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

## Additional approved wording and approach preferences
- Prefer connected narrative sentences using "and" over semicolons and dashes. This does not remove compact list formatting or prior-procedure response separators.
- Distal is the default dorsal scapular nerve block approach. Consent and technique must follow the selected approach. Proximal remains an explicit option. Actual positioning, needle and observed spread override template defaults.
- Lifestyle medicine referrals mean Dr. Njaa. Correct dictated "Nia" to "Njaa" in this context. Do not apply this correction to unrelated names or specialties.
- Insert two blank lines before the IMPRESSION heading in clinical notes.
- Place the heading "PROCEDURE NOTE" immediately above "Procedure performed:" in procedure documentation.
- Landmark GT injection template: advance to bone contact, then withdraw slightly before injecting. Patient-specific technique always overrides this draft default.
- All landmark procedures default to no assistant. Omit "assisted by MOA" and other assistant attribution unless Victoria explicitly documents assistance for that encounter.

## Epidural scheduling wording
- When bilateral epidurals are planned on separate days because of Victoria's fee-schedule constraint, use: "We are limited to one epidural injection per day, so the left and right sides will be treated on separate days."
- Add "He elected to proceed on consecutive days" or "She elected to proceed on consecutive days" only when that preference was actually expressed. Otherwise retain the actual scheduling plan.
- This is a practice scheduling constraint reported by Victoria, not a universal clinical safety rule or an independently verified payer rule. Do not attribute separate-day scheduling to stenosis, postoperative anatomy or another medical rationale unless Victoria explicitly provides that rationale.

## Plan layout and follow-up ownership
- Default fluoroscopic PLAN formatting is a single bullet with all procedures on the same line, separated by commas. Example: `- Fluoro: right S1 TFESI, bilateral L5/S1 facets.` Preserve the actual patient-specific targets. This is a formatting example, not a treatment default.
- Only for a particularly complex plan, or when Victoria requests it, use one `- Fluoro:` heading followed by procedures on separate unbulleted lines. The earlier multi-line example was a complex-case exception, not the general rule.
- Keep a conditional injectate decision on the same line as its associated procedure, rather than making a standalone bullet. Preserve the actual patient-specific indication, drug, dose and condition. This formatting example does not establish a universal treatment or injectate default.
- Routine PLAN bullets follow consecutively without extra blank lines. When using the complex multi-line procedure layout, leave a blank line before the next non-procedural bullet.
- Do not automatically repeat overnight accommodation or division across days as separate PLAN bullets when already explained in the impression. Preserve logistics when Victoria specifically wants them in the plan.
- When Victoria plans her own virtual response review followed by the referring surgeon's reassessment, use: "Following completion of the injections, I will follow up with him virtually and remind him to book a virtual appointment with your office to review his response and further management." Adapt pronouns and modality to the actual plan.
- Do not replace this with referring-provider-only follow-up, automatic discharge, or a fixed surgeon appointment that was not arranged. Current dictated follow-up takes precedence over older surgical stop-point macros. Do not assume every surgeon intends reassessment without supporting documentation.

## Physical examination workflow
- The agreed back, cervical, shoulder and knee macros and optional SIJ, GT and deep gluteal prompts are in `skills/clinic-visit/references/physical-exam.md`. Read that reference when drafting examinations.
- Collect findings from the entire dictation regardless of order. Invoke normal findings only through Victoria's explicit shorthand. Add focused selectable prompts when a diagnosis lacks dictated examination support, without asserting that unselected positive findings occurred. Preserve whole-note consistency review.

## Pre-chart clinical partnership and transcript workflow
- Pre-chart preparation includes a concise critical clinical review by default. This supersedes older extraction-only rules that required a separate request for reasoning. Keep the factual chart-prep block separate from analysis for Victoria. Do not write a completed current exam, established diagnosis or treatment decision before the encounter.
- Provide a prioritized differential grounded in the referral, symptoms, imaging and prior response. State the relevant supporting or conflicting evidence, not an exhaustive generic list.
- Suggest a small number of discriminating examination maneuvers and history questions that could change the diagnosis, target, treatment or urgency. Use agreed regional exam templates where helpful without asserting suggested tests were performed.
- Flag actionable concerns relevant to this pain encounter and potential intervention. Examples include platelet count/date/trend, anticoagulant or antiplatelet drug/dose/indication, renal function when relevant to drug management, active infection, progressive neurological deficit, or material steroid/medication risk. Do not turn every comorbidity into a warning or duplicate settled issues.
- Each flag should explain why it matters now and the clarification or action it could change. Distinguish an urgent finding from an outpatient clarification and missing documentation from known abnormality. Do not infer anticoagulant holds or numeric safety thresholds without the necessary procedure and patient context. Verify uncertain management-changing claims when needed.
- Victoria conducts the entire patient encounter. Heidi may capture it. Initially accept Heidi's generated output plus Victoria's short account of remarkable findings, impression and decisions. A raw transcript may be supplied instead or additionally. Do not require duplicate exports routinely.
- Distinguish a raw transcript from a generated note. Neither is independently verified evidence, and generated summaries may omit nuance or insert unsupported findings. Never claim to have checked a transcript if only a generated note was supplied.
- Victoria's explicit corrections and final decisions govern the final draft. Integrate additional history and findings from the supplied encounter material, but flag material conflicts or suspicious boilerplate rather than silently accepting or discarding them. Do not expand a normal exam macro based solely on an AI summary's generic normal-exam statement without Victoria's invocation or confirmation.
- Preserve source chronology and speakers. Plans discussed as possibilities are not final decisions. Extract exam findings regardless of where they appear. Deliver the complete note plus a brief, separate review focused on meaningful discrepancies. Ask for source clarification only when it changes care or factual accuracy.

## Visit purpose and documentation of medical necessity
- Always include the follow-up purpose in the second opening sentence alongside modality. Infer it when clear from the transcript or encounter, even if not separately dictated. Preserve the first sentence's age, patient description and chief complaint.
- If the purpose is unclear, insert a focused clickable prompt rather than leaving it blank or silently choosing a reason. Example: "This was a phone follow-up to [reassess symptoms|assess response to the previous injection|review medication response|review imaging|decide on interventional management]." Tailor options to the encounter. This approved purpose prompt overrides older universal null-first pick-list rules. Do not invent a purpose merely to support billing.
- Document why the visit was needed, what was assessed and what was decided in natural clinical prose. For an in-person encounter, include the current focused examination supplied or explicitly invoked. If missing, prompt or flag it rather than presenting historical findings as current. Retain Previous EXAM where useful.
- Capture a meaningful functional outcome when supplied, such as walking distance, sitting tolerance, sleep, dressing or work capacity, alongside relief and duration. Do not fabricate metrics or require irrelevant ones.
- Make follow-up ownership explicit from the actual plan: who reviews the response, when, and any agreed trigger for earlier review. Use focused prompts for material unresolved ownership rather than inventing arrangements.
- On procedure days distinguish a separately necessary assessment from routine procedure preparation. Visit-purpose wording alone does not establish billing eligibility. Keep code review outside the note and defer a broader payer-rule review until requested.

## Follow-up baseline, interval history and procedure consistency
- IMPRESSION remains a complete clinical paragraph beginning with age and sex, followed by the working diagnosis, relevant contributors, treatment rationale and intended functional benefit. Do not reduce it to a procedure summary.
- Every follow-up note includes PAIN HISTORY, INTERIM HISTORY and an examination section, in that order before the impression.
- Convert the initial consultation's HPI into a concise PAIN HISTORY retaining pertinent onset, distribution, character, aggravating/relieving factors and baseline functional limitations. This provides context and a comparator for follow-up. Do not invent functional measurements.
- INTERIM HISTORY is separate and records what has happened since the last encounter, including response and current decisions. Do not merge today's interval update into the baseline pain history.
- When carrying forward an older follow-up, consolidate relevant older pain/interim history into the baseline where useful, while updating medications, investigations and previous procedures in their own sections. Avoid repetitive historical interval sections.
- Preserve previously documented examination findings under Previous EXAM when no new examination is supplied. A full examination is often not repeated on procedure days. Do not imply it was repeated or request a full examination merely to complete the note. Include any genuinely new focused findings separately as current findings.
- Whenever Victoria says a procedure was performed, read the applicable entries and shared generation logic in procedure-note-builder.html and use its complete applicable default wording for consistent output, subject to the authorized builder drafting workflow above. Patient-specific details override defaults. This is required for consistency, not an optional reference. Label undictated defaults together outside the note and do not claim the generator ran unless it actually ran.

## October 21, 2026 — approved refinements and documentation lessons
- For a lumbar nerve root block with a separate steroid-only epidural component, use the HTML `lumbar_root_sequence` card, one side and root per card. Select local-anesthetic nerve root block only or steroid-only epidural followed by nerve root block independently at each level. This is distinct from standard TFESI with a local-anesthetic flush.
- In the combined sequence, preserve chronology: initial contrast findings, epidural steroid alone, slight needle withdrawal/repositioning, repeat contrast findings, then local anesthetic at the nerve root position. Record initial and repeat contrast volumes and their sum, with each drug on its own target-specific line. Do not add an epidural lidocaine flush by default.
- Record symptom reproduction separately by level and, when supplied, by phase. Preserve actual repeat spread, including epidural extension when observed; never equate needle withdrawal with confirmed selective spread. Any stated contrast-clearing rationale is optional encounter-specific wording, not a claim that steroid clears all contrast or makes the subsequent block diagnostically independent.
- Keep INTERIM HISTORY to interval symptoms, response to earlier treatment, current function and the decision to proceed. Do not put today's needle findings, contrast spread, symptom reproduction or immediate post-procedure response in this section.
- IMPRESSION begins with a full age/sex-based clinical assessment paragraph. Put today's performed procedure, important immediate findings and therapeutic intent in a separate paragraph. Technical detail belongs in PROCEDURE NOTE.
- Use TFESI in procedure titles, e.g. "Fluoroscopy-guided left L5 TFESI at L5/S1, supraneural approach." Preserve nerve-root target and access level separately.
- Injectate uses compact target-specific bullets: "- Bilateral SI joints: 3 cc lidocaine 1% + 2 cc methylprednisolone 40 mg/mL, divided between the two joints." Put contrast on its own line, e.g. "- Contrast: 1 cc." These are formatting examples, not universal doses.
- Use methylprednisolone rather than brand shorthand. Omit redundant total-steroid-dose bullets when dose is already clear from concentration and volume. Still check total drug exposure internally and flag material discrepancies outside the note.
- Use L2–S1 and C5–T1 notation for the corresponding neurological examinations when supported. Motor grading belongs to motor testing; describe sensation as intact, normal, reduced or absent, not 5/5. Do not convert vague findings into precise grades or assume historical findings were retested.
- Keep plan responsibility explicit: "I will", "our office will", or "I would appreciate your..." according to the actual plan. Do not invent follow-up arrangements, referrals or anticoagulant interruption plans.
- For a corrected previous side or level, clearly identify the prior service and correction, then keep today's side/level consistent throughout. A retrospective suspicion remains a suspicion, not a confirmed correction. Recommend a dated amendment preserving the original record when appropriate; never imply the EHR was edited.
- Describe meaningful technical limitations, attempted adjustments and the clinician's reason for accepting the final position. For example, repeated pars contact during repositioning may be documented alongside satisfactory observed contrast flow and confirmed views, if those facts were supplied. Do not fabricate a rationale from an uncertain transcript.
- Do not carry over an earlier procedure's exact contrast extent, outcome, assistant or imaging details merely because today's technique was described as the same. Use authorized applicable template defaults with the grouped disclosure, and preserve today's actual findings.
- Distinguish therapeutic medial branch blocks from diagnostic testing for RFA. A therapeutic volume or multi-target response must not be described as establishing a specific pain generator or RFA candidacy.
- For an aborted target, document the attempted side/level, reason for stopping, any injectate actually delivered, observed symptoms, advice and monitoring. Do not apply a blanket "Complications: None" when a procedural event was dictated. Do not infer that a needle projecting over bone excludes pleural injury or that contrast safety was established from projection alone.
- Clarify meaning-bearing speech-recognition errors using source context. Do not generalize a patient-specific correction such as TON versus T1, pars versus "parts", or myofascial versus "mild facial" into an automatic substitution for all future cases.
- Distinguish early pain relief from durable benefit and functional recovery. Preserve statements that usual activities have not yet been attempted; do not infer improved work or activity tolerance.
- Keep concise review and default disclosures outside the copyable note. Resolve explicit clinician corrections without repeatedly flagging the same settled issue. Never save patient identifiers, clinical notes or transcripts into the reusable skill or shareable bundle.

## Nerve root sequence wording refinement
- For undictated nerve-root spread in the lumbar_root_sequence template, use Victoria's wording: "demonstrated nerve root spread, predominantly in parts where there is epidural spread." Explicit observed findings override this draft default. For the selected steroid-only epidural phase, retain the specific initial nerve root tracking and epidural spread wording.
- Omit the sentence "No local-anesthetic epidural flush was given." Keep the actual separate drug sequence clear without that redundant negative statement.
- Use compact paragraphs identifying the root and access foramen in the sentence. Do not add standalone "L3:", "L4:" or "L5:" subheadings. Keep target-specific injectate bullets.

## Colleague correspondence — concise clinical updates
- Omit obvious or preachy interpretive caveats, such as "combined treatment limits attribution to a single level," unless the limitation materially affects a clinical decision. Focus on what was done, the observed response, relevant adverse events and next steps. Preserve clinically necessary uncertainty without teaching the recipient routine concepts.

## Phone-visit procedure booking handoff — October 22, 2026
- When a phone visit ends with a definite decision to arrange a procedure (for example, "we will arrange" or "our office will contact"), append a separate copyable booking block after the clinical note. Do not trigger for a merely possible procedure, a completed procedure, or a routine follow-up appointment without procedure booking.
- Use exactly the six fields below, without an "MOA BOOKING TASK" heading, patient/contact fields, timing or additional-details fields:

```text
Procedure: [Procedure, side, levels and guidance]
Booking duration: 30 minutes
Anticoagulation: [Medication and documented plan / none / not confirmed]
Antiplatelets: [Medication and documented plan / none / not confirmed]
Steroid: [Yes / no / not confirmed]
Ativan: [Requested / declined / please ask patient]
```

- Populate the fields from the final plan and patient-specific record; the brackets above describe alternatives rather than literal output. Use 30 minutes unless a different duration is explicitly supplied. Keep side, levels and guidance faithful to the booking decision.
- Include ASA under Antiplatelets. Record only documented interruption/restart instructions; do not infer a hold from drug use or a procedure template. If a medication is known but its management plan is missing, retain the medication and state that the plan is not confirmed. Do not turn missing medication information into "none".
- Steroid reflects the agreed procedure/injectate when established; otherwise use "not confirmed". For Ativan, use "please ask patient" when preference is absent, rather than "not discussed". This is a request to establish preference, not authorization to prescribe or administer medication.
- Keep the booking block separate from the clinical note. Generating it does not send a message, create an external task or book an appointment.


## October 22, 2026 — clean copyable notes and consistent neurological examination
- Keep assistant/editorial comments out of the copyable clinical note. Do not write phrases such as "current use requires reconciliation" or "requires confirmation" as drafting commentary. Put unresolved medication use, missing facts and source discrepancies in the concise review below the note. Do not conceal clinically material uncertainty or invent a resolved fact.
- When an embedded clarification is useful, use a focused square-bracket choice such as `[taking|discontinued]`. Do not promise that plain-text choices are clickable; that depends on the destination editor.
- When Victoria explicitly supplies a normal lower limb examination or invokes the normal shorthand, consistently render motor as `L2–S1 5/5 bilaterally.` and sensation as `L2–S1 intact to light touch bilaterally.` Specific abnormal findings override the corresponding normal statement. Her explicit corrections take precedence over the transcript.
- Do not expand a partial examination into untested roots or silently assign normal findings when the examination is missing or ambiguous. Flag material uncertainty below the note. Preserve separately supplied gait/function and reflex findings, including reduced patellar reflexes or absent Achilles reflexes.
- Before delivery, check motor, sensation and reflexes for consistent formatting and evidentiary support; preserve all explicit exceptions; remove drafting comments from the copyable text.


## October 22, 2026 — booking handoff wording refinement
- Start the separate phone-visit booking block with `Please book:` followed by a blank line. This supersedes the earlier instruction to omit all heading text; do not use `MOA BOOKING TASK`.
- Retain the six fields: Procedure, Booking duration, Anticoagulation, Antiplatelets, Steroid, Ativan. Default booking duration remains 30 minutes.
- Make confirmed procedure laterality conspicuous with uppercase `LEFT`, `RIGHT` or `BILATERAL`. Preserve an explicitly agreed alternative such as `Possible lumbar medial branch blocks instead if clinically indicated.` Do not add unnecessary technical detail or infer levels or laterality.
- For historical negative anticoagulation screening, use `None reported at [visit date] visit; please confirm current status.` For a supported negative antiplatelet history, use `No; please confirm current status.` Do not turn unknown antiplatelet status or a screen excluding ASA into an unqualified `No` unless Victoria supplies the correction. Retain known drugs and actual management plans.
- Keep steroid wording brief: `Steroid: No` or `Steroid: Yes` when established; no redundant explanation. Use `Ativan: please ask patient` when no preference is supplied.
- Patient-specific corrections (such as LEFT in an individual booking) apply only to that patient, not as universal defaults.


## October 23, 2026 — compact booking procedure and duration fields
- In the booking handoff, format the procedure as guidance first, then uppercase confirmed laterality, then the abbreviated procedure/target: `Procedure: Fluoro, RIGHT S1 TFESI`. Use the actual guidance, side and target for each patient; RIGHT S1 is an example, not a default. Avoid repeating `under fluoroscopic guidance` at the end.
- Use `Duration: 30 minutes` instead of `Booking duration: 30 minutes`. Keep 30 minutes as the default unless a different duration is supplied.
- Preserve `Please book:` followed by a blank line and the remaining fields: Anticoagulation, Antiplatelets, Steroid, Ativan. Preserve documented medication plans and polite status-confirmation wording.
- The latest example is:

```text
Please book:

Procedure: Fluoro, RIGHT S1 TFESI
Duration: 30 minutes
Anticoagulation: None reported at [previous visit] visit; please confirm current status.
Antiplatelets: Please confirm current status, including ASA.
Steroid: Yes
Ativan: please ask patient
```

The example illustrates formatting only; populate every clinical field from the current case.


## October 23, 2026 — initial telephone consultations and inline medications
- For initial consultations conducted by telephone, explicitly state the access rationale in the second opening sentence: "This consultation was conducted by telephone to improve patient access, assess symptoms and discuss interventional options." The phrase "to improve patient access" is essential. Precede it with the usual patient-specific "Thank you for referring this pleasant [age]-year-old [female/male] with [chief complaint]." Do not apply this initial-consult opening indiscriminately to follow-ups.
- Format CURRENT MEDICATIONS as one inline paragraph following `CURRENT MEDICATIONS:`, with medications separated by commas or semicolons. Preserve supported doses and frequencies. Do not switch to a vertical bulleted medication list unless explicitly requested.
- Keep medication discrepancies and editorial clarification outside the copyable note in the concise review, or use a focused bracketed choice when needed; do not silently resolve conflicting doses.


## October 23, 2026 — final-note feedback
- Label historical examination findings supplied by the referring clinician `Referral exam`; reserve `Previous EXAM` for prior examinations from this clinic. Keep today's telephone EXAM separate.
- Prefer compact investigation labels such as `Thoracolumbar XR`, `Lumbar XR` and `Hip/pelvis XR`. Keep the report summary factual; avoid inserting additional correspondence into the investigation summary. Preserve clinically material differences between source interpretations where relevant to the assessment.
- Keep IMPRESSION focused on the reasoned assessment and procedural discussion. Avoid repeating HPI negatives and functional limitations unnecessarily or adding routine appreciation paragraphs unless requested. Warmth should be natural and proportional to the user's instruction.
- Keep PLAN compact, generally one actionable procedure line where sufficient. Use specific confirmed procedure names (e.g. IA facet injections, ESPs) when the clinician supplies them. Do not infer those procedures from ambiguous descriptions or generalize a patient's targets to future patients.
- Use final clinician edits as the authoritative patient-specific procedure clarification. Keep confirmed laterality consistent: if an adjunct is explicitly bilateral, any unresolved laterality applies only to other targets, not to that confirmed adjunct.


## October 23, 2026 — actionable booking and calibrated uncertainty
- Distinguish clinician-confirmed decisions, details intentionally deferred until procedure day, and genuinely missing information. Preserve confirmed decisions; do not repeatedly request confirmation of facts the clinician has explicitly settled.
- When alternative targets are specified, name them and the agreed time of selection (for example, LEFT L5 vs S1 TFESI; nerve root level to be confirmed on day of procedure). This is a formatting example, not a default target. Do not replace useful alternatives with a vague unspecified level.
- Booking is a concise scheduling handoff. Use confirmed screening and steroid details directly. Date-attributed negative anticoagulation history may stand without an added confirmation clause when this is the clinician's final wording. Do not infer negative screening from missing information.
- Use `Ativan: Please ask` when preference is unknown. Do not replace this preference question with `No sedation planned` solely because the procedure discussion required the patient to remain communicative. Asking about preference does not authorize medication or override the clinician's sedation plan; retain explicit contraindications or restrictions and flag an actual conflict separately.
- Put genuine unresolved clinical questions outside the booking unless scheduling depends on the answer. Preserve explicitly deferred decisions without treating them as blockers.
- Preserve confirmed history, concrete functional gains, and the clinician's reasoned rationale for intervention despite inconclusive investigations. For electrodiagnostic uncertainty, prefer precise wording such as `A negative EMG does not exclude radiculopathy` over absolute sensitivity/specificity claims.


## October 23, 2026 — phenol-specific booking logistics
- For planned phenol procedures, retain the usual six-field booking block and append the following operational instructions. This is an explicit exception to the general rule against extra booking details.
- Book after 11 a.m. to allow the compounded phenol time to warm. Do not book on the Tuesday immediately following a long weekend.
- Once a procedure date is confirmed, notify Dr. Tian so she can send the phenol prescription to Medicine Shoppe on Baltzan. Do not imply the prescription has already been sent or that the assistant sends it.
- Include a separate MOA task: remove the phenol from the refrigerator early on the morning of the procedure. These are the clinician's clinic-specific handling instructions; do not invent active heating methods, temperatures or warming durations.
- Draft the booking and MOA handoff together. Do not claim a real task was assigned, a notification sent or an appointment booked unless an authorized tool actually completed it.
- Laterality, medication screening and prior visit dates remain patient-specific; do not generalize the example patient's LEFT side or September 16 date.


## October 23, 2026 — approved phenol handoff prose
- Preserve the usual six-field `Please book:` block, followed by two natural prose paragraphs. Do not reorganize the phenol logistics into extra headings, bullet lists, or a separate MOA task section. Make only light grammar corrections.
- Use this wording after the booking fields, adapting pronouns to the patient:

Once you have a date, let me know. I'll need to send the prescription to Medicine Shoppe on Baltzan.

Please task an MOA to take the phenol out of the fridge early on the morning of the procedure. Please book her later in the day (after 11 a.m.) so the phenol has time to warm. Please don't book on a Tuesday after a long weekend.

- The MOA request remains embedded in this paragraph, not a separately headed task. This formatting supersedes earlier wording calling for a separate MOA task. Preserve all operational requirements and distinguish drafted instructions from actual task assignment.
