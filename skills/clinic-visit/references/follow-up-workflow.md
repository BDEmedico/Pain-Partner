# Returning patient and procedure-encounter assembly

Use the latest approved complete note as the starting document. Shared preferences control style, defaults, examination and delivery; this reference only defines the update operation.

## Carry-forward ledger

Before drafting, account for:
- Age/sex, chief complaint, referrer/FP and last-visit date.
- Medical history and surgical history, including relevant operative levels/dates.
- Current medicines with supported doses, allergies/intolerances and relevant social context.
- Previous medicines, non-pharmacological treatment and procedures with documented response.
- Investigations with original dates and clinically important findings.
- Baseline pain history and historical examination.
- Accepted IMPRESSION and any current evidence that changes its assessment.

For each section choose retained, updated by a current source, or omitted only at the clinician's request. This ledger is internal, not output. Do not use an `omitted_reason` to justify dropping established history merely for brevity.

## Update, do not restart

1. Convert the original HPI to PAIN HISTORY if this is a follow-up. Preserve baseline distribution/function and relevant course. Earlier interim events may be condensed into it to avoid accumulating repeated interval sections.
2. Add today's INTERIM HISTORY: symptom change, response to prior treatment, functional change, preference and decision. A pain diary may measure total pain rather than target pain; preserve the clarification and time course.
3. Update medications, diagnoses, imaging and prior procedures only where supported. Keep consequential unresolved discrepancies for external review, not silent reconciliation.
4. Retain the earlier examination as `Previous EXAM` (or `Referral exam` for a different clinician). Add current findings separately when supplied. Do not imply historical negatives were reassessed.
5. Apply the shared preferences' IMPRESSION carry-forward rule. Compare it with the accepted assessment and retain each unchanged sentence. Update PLAN to the current decision, removing completed/abandoned items. Keep conditional treatment conditional, and do not infer new target levels from the diagnosis alone.
6. For performed procedures, apply `procedure-workflow.md`. The detailed technical account belongs there, not repeated in interim history and impression.

Review response, anatomy, symptoms, medicines, procedure and plan together. Preserve meaningful uncertainty and the clinician's intended follow-up. Do not automatically discharge surgical referrals, impose a follow-up interval, add a generic multimodal treatment plan or recommend medication holds.

Do not reformat accepted wording merely for style. A correction request gets corrected sections or a complete note as requested; after any procedure-note revision rerun verification on the final version.
