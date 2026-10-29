# Prechart and new-consult source assembly

Policy and output rules live in shared preferences. This reference explains source assembly; it does not override those rules or duplicate procedure defaults.

## Prechart

1. Read the referral, supplied consultant notes, actual imaging/lab reports, medication screenshots and intake. Deduplicate identical sources. A newly named patient starts a separate chart.
2. Preserve source-supported age, reason for referral, medical/surgical history, medication regimen, allergies, social context, previous treatments, investigations and pain history. For absent prechart information use a short neutral entry, not a fabricated negative. The performed-procedure NKDA authorization is defined in shared preferences.
3. Use supplied laboratory values with dates. Usually CBC, creatinine and HbA1c suffice; include other management-changing or specifically supplied findings. Do not call the whole CBC normal when relevant abnormalities exist. A flagged list entry does not supply a numeric value.
4. Preserve imaging levels, sides, roots, degree of stenosis and comparisons relevant to the referral. Distinguish the report from a consultant's interpretation. Summarize without changing meaning; do not add a study merely because it was mentioned without findings.
5. Treat pharmacy records as prescribing/dispensing evidence. Retain patient-reported OTC medicines and supplements, distinguish current from previous where supported, and do not infer diagnoses from drugs. Explicit cessation overrides an old fill; a stale fill alone does not establish cessation.
6. Record surgical referral context: surgeon, stated candidacy/contingency, requested block aim, follow-up timing. Do not infer operative eligibility, mandatory discharge to the surgeon or an unrequested injection. Keep unresolved facts in the external review rather than an extensive mandatory pick-list.
7. Do not fabricate a current examination or completed treatment. Provide the factual chart plus concise external differential/discriminating exam suggestions and material review flags.

Only clinician-requested reminders belong in an optional `*******TO DO************` prechart section. Do not turn assistant suggestions into orders. In a completed note, unresolved reminders stay in review unless the clinician made them part of the plan.

## After the encounter

Merge the encounter into the prechart. If a previous complete note exists, use `follow-up-workflow.md` rather than rebuilding a shorter history. Preserve current patient-specific corrections throughout the note and any booking block.

- HPI: onset/course, current distribution and quality, aggravating/relieving factors, functional limitations, relevant prior treatment and specialist reasoning. Attribute disputed facts. Do not repeat dedicated medication/screening sections here.
- EXAM: follow `physical-exam.md`. Extract findings from the whole dictation; no automatic normal neurological or red-flag macro from absent information.
- IMPRESSION: age/sex, reasoned pain generators and the actual decision. Diagnostic uncertainty remains uncertainty. Do not invent rationale merely to fill a formula.
- Procedure, if performed: run `procedure-workflow.md`.
- PLAN: actual decisions and follow-up ownership. Consent uses the applicable HTML; do not add a second generic counselling essay. Steroid counselling only when steroid is part of the plan. Diagnostic blocks do not inherit a three-month therapeutic response target.

Red-flag negatives require source support and chronology. No standing anticoagulant hold schedule is applied; use the actual documented individualized plan. Imaging, laboratory tests, medications or referrals are not ordered merely because they would improve a note.

Finish with the shared review and delivery rules. Preserve clinically important uncertainty while keeping drafting comments outside the copyable chart.
