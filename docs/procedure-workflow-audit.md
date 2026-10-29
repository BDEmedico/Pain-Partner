# Procedure workflow audit and regression record

## Scope and authority

Authorized work: audit original skill + HTML, establish one output example, test previous failure patterns, add a narrow verifier. The latest explicit user corrections govern the consolidation. No patient data is included. Earlier changes already present in the working tree (the physical-examination consistency gate) were retained and consolidated, not reverted.

## Root causes found and repairs

| Finding | Repair | Evidence/check |
|---|---|---|
| Accumulated dated rules contradicted one another; older references demanded an all-caps procedure wrapper, separate target formatting and outdated booking labels | Consolidated shared preferences into one current policy, shortened clinic skill into a required execution route, replaced obsolete source/follow-up instructions | Policy integration regression; source diff |
| Complete previous charts were replaced by shortened procedure summaries | Explicit section/fact carry-forward ledger, required section checks and source-linked evidence including age | Missing-history and changed-age rejection tests |
| Vague motor/sensory wording returned; macro itself used a different sensory sentence | One canonical exam reference; fixed supported sensory macro, no uninvoked normal exams | Vague-exam rejection and canonical-macro regression |
| Template could be skipped while response claimed defaults were used | Required source-based template step, actual source hashes/anchors and shared-logic receipts in verifier | Missing/unread/stale template and shared-logic tests; receipts are attestations, not proof of reading |
| Known allergies could lose to an NKDA selection | Authorized NKDA default, known allergy text takes precedence | Actual generator and verifier tests |
| Technical failure appended to successful-access wording | Target-level replacement field replaces routine technique; title can remain clinician-confirmed selective block | Actual limited-root generation test |
| Routine aftercare declared recovery even when an event was recorded | Events no longer imply transient/recovered; default stable discharge suppressed unless replaced with explicit aftercare | Actual adverse-event generation tests |
| Fluoroscopic trigger points claimed visually seen intramuscular spread | Removed visual-spread claim for that modality | Actual modality regression |
| Generic diagnostic plan automatically implied RFA for unrelated procedures | Neutral response-review default; specific RFA decisions remain clinician-selected | Actual generator regression |
| Repeated local-infiltration sentences and extra headings | Deduplicate identical local prose, retain inline labels and narrative paragraphs | Combined-procedure generation tests |
| Follow-up workflow still instructed rewriting IMPRESSION despite accepted wording | Replaced the rewrite instruction with the approved verbatim carry-forward rule; added assessment comparison to the source review | Targeted source search and review of preferences/follow-up/procedure workflows |
| US TON/cervical MBB inherited the diagnostic label and smaller TON volume | Scoped therapeutic US pathway with lidocaine 1% 1cc per site; diagnostic choice restricted to Fluoro and protected against stale flags | Actual assembled-note, unilateral/B/L, TON-only and modality-switch regressions |
| Older references silently supplied normal red flags, fixed DOAC holds, auto-discharge to surgeon or universal efficacy thresholds | Removed blanket additions; require actual case-specific decisions and supported findings | Consolidated source-reference review |

## Example and reviewer design

`skills/clinic-visit/references/procedure-example.md` is the single synthetic full-chart layout candidate. The user approved the rules and this implementation task; **final visual approval of this exact example is still pending**. Do not falsely mark it approved. Supporting invented inputs are in `tests/fixtures/procedure-review/`.

The review is a small stage within the existing clinic skill, not a separately maintained clinical policy or duplicate installed skill. It checks the draft against the same preferences, source material and HTML. Python reports failures; it does not reword a sound chart. The drafting agent repairs only failures and reruns.

## Repeatable validation

Run:

```sh
bash scripts/check_procedure_workflow.sh
```

This runs Python synthetic verifier and full-example integration regressions, two actual-HTML generator suites, portable bundle hash/integrity checks and whitespace checks. Python tests deliberately introduce missing history, changed age, missing/stale template receipts, unwanted headings, vague exam wording, wrong sides/levels, incorrect dose/dilution, source-evidence mismatch, missed review and contradictory complication defaults. Ordinary, limited and combined procedure cases are included.

Passing these regressions demonstrates only these checks. It is not a measured reduction in real-world medical errors. The source-to-note reviewer must still identify omissions, meaning, unsupported findings, duplicate paraphrases and clinical consequences that exact-string checks cannot.

## Deployment and limitations

- The CLI returns nonzero on missing inputs or failed checks; final-draft hashes invalidate old review after edits.
- The manifest is a declaration by its reviewer. Hashes show source identity and quotes show linkage; they do not prove comprehension or prevent a consistently incorrect declaration from passing.
- The host currently offers no verified mandatory pre-response hook. The skill requires review but cannot enforce invocation at the application level. Do not claim an unskippable second system has been installed.
- Bundle creation is not installation or account-wide publication. See PUBLICATION.md for actual deployment checks.
- No external messages, clinical orders, patient uploads or GitHub publication of patient content are part of this work.
