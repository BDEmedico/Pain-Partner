# Procedure drafting and narrow verification

This is an execution sequence, not a second set of clinical policies. Use shared preferences for rules, the HTML for defaults, and physical-exam.md for examination wording. Every performed procedure follows this sequence, including revisions.

## 1. Read and inventory

Read the actual previous chart, current encounter/corrections and relevant reports. Build the carry-forward ledger described in follow-up-workflow.md. Read the selected HTML entries and shared `screenBlock`, `consentParagraph`, `procedureNote`, injectate/local-dose and `tailBlock` logic. A template snippet alone is insufficient to claim complete builder use.

For each selected procedure collect: procedure name/intent, side, nerve target and access level separately, guidance, needles, drugs, starting concentrations, administered volumes, mixture allocation, observed spread, complications/recovery and follow-up. Identify which values are dictated, carried forward, defaulted or unresolved. Defaults cannot add an unselected procedure or override a known fact.

## 2. Draft from the approved chart structure

Carry the full prior chart forward, updating the relevant sections. Under IMPRESSION use inline `Procedure performed:` and builder fields with connected technique paragraphs. No added standalone procedure/target headings. Preserve the clinician's named procedure and describe technical limitations accurately in its narrative.

For actual HTML generation, use the target's **Replace technique paragraph** field when the routine successful technique is contradicted; do not merely append a failure to a success paragraph. Update injectate and aftercare independently. For manual assembly do the same replacement explicitly. Do not claim to have executed the generator when only its source was used.

Use one grouped default disclosure outside the chart. The synthetic layout in procedure-example.md is a candidate for final visual approval; its invented findings/medicines/targets are never clinical defaults.

## 3. Evidence-linked review, separate from composition

Compare the completed draft back to the sources, not just to your memory of drafting it. Check:
- Source completeness: each established chart section and important fact is retained or changed for a documented reason; age/referrer/current patient agree.
- Assessment continuity: compare IMPRESSION with the accepted prior assessment under the shared carry-forward rule. Each changed sentence needs new evidence affecting the assessment; restore unsupported stylistic rewrites without altering current procedure documentation or PLAN.
- Examination fidelity: each line is supported, dated correctly and uses the agreed wording; abnormalities were not lost and no uncertain test name was invented.
- Dictated exceptions: each limitation, withheld/aborted target, changed dose, adverse event and outcome overrides the routine template. Known allergies override NKDA.
- Assembled template: compare the completed procedural block with the shared builder output, including consent, screening, the surgical safety checklist, injectate and applicable aftercare. Reading a procedure entry or the shared source alone does not establish that all applicable content reached the final draft.
- Clinical consistency: title, narrative, injectate and plan agree on side, levels, intent and what was actually done. Compute administered dose/dilution per drug and total exposure. Check no repeated explanations or invented follow-up.

For this pass, a separately invoked reviewer can help if available, but it must read the same authoritative sources; never claim independent review unless it actually occurred. Otherwise perform this as a distinct source-comparison pass and describe it honestly.

## 4. Run the verifier and repair only failures

Save live draft/source/review files in a temporary directory outside the repository. Never commit or bundle them. Use `scripts/PROCEDURE_VERIFIER.md` (bundled: `references/verifier.md`) for the manifest schema. The manifest contains exact source and final-draft hashes, quoted evidence, carried sections/facts, selected HTML entries/shared logic, target/dose declarations and completed semantic-review attestations. It is an internal artifact, not part of the medical chart.

Repository invocation:

```sh
python scripts/verify_procedure_note.py --note /tmp/encounter/draft.txt --manifest /tmp/encounter/review.json
```

Portable invocation: use the same flags with the packaged `scripts/verify_procedure_note.py` under this skill. Do not assume a provider resource is a filesystem path; obtain it through the provider and use an available execution environment.

A nonzero result means the draft is not mechanically cleared. Repair the specific mismatch, rerun the source-based review for affected facts and regenerate the final-draft receipt. Do not weaken expectations or mark an unperformed review complete just to pass. Keep a sound sentence unchanged when no failure applies. Do not ask the user to check routine formatting, template fields or dose arithmetic that can be checked here.

The program checks declared facts and review evidence. It cannot prove understanding, find every omitted fact, independently interpret anatomy or validate that care occurred. A hash verifies source identity, not reading. The pass condition is narrowly named `machine checks plus review attestations`, not `clinically validated`.

## 5. Deliver and report capability honestly

Deliver the exact reviewed chart, followed by one default disclosure and only material unresolved questions. Do not alter it after verification without rerunning affected checks.

The CLI fails closed when invoked, but this chat host has no known application-level mechanism forcing invocation or blocking a reply. This skill mandates the step; it does not create that mechanism. If Python execution is unavailable, perform the evidence-linked manual review and state `Automated verifier unavailable; source-based manual review completed.` If required sources cannot be read, do not claim full review. Resolve routine independent work and identify the specific missing input.

## Maintenance checks

After changing preferences, HTML, macros or verifier, run the regression suite documented in `docs/procedure-workflow-audit.md`, then rebuild the portable bundle. Retain deliberate failing cases as tests. Never reduce the tests simply because a new output fails them; first determine whether the latest user-approved rule changed.
