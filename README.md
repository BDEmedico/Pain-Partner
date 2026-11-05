# Pain Partner

Reusable pain-clinic drafting instructions and standalone procedure-note and booking builders.

## Use in a chat

The chat needs access to this workspace, or to a published version of the existing Pain Partner plugin. Typing its name does not load local files into an unrelated chat. A GitHub push or bundle build does not publish the installed plugin.

With the workflow available, say:

> Use Pain Partner's clinic-visit workflow. Combine my old chart and new dictation, apply the current HTML defaults and run the procedure-note verifier before returning the completed chart.

For an examination-only change, say `Use the exam HTML for this section only.` For booking, say `Use the booking generator to create the MOA task.` The assistant prepares the inputs and runs the tools.

To check an installed release, ask the assistant to read `clinic-visit/references/release.md` and report its release identifier and available execution tools. Publication and availability still need verification in a new chat; see `PUBLICATION.md`.

## Files

- `procedure-note-builder.html`: download and open in a browser. Includes the revised blood-aspiration wording, distinct from joint-fluid aspiration.
- `booking-builder.html`: standalone booking editor and preview, supporting multiple appointments, explicit timing, diagnostic-to-treatment conditions and phenol logistics. Fixed rules generate the MOA text; no patient data is sent or stored by the page.
- `scripts/render_booking.cjs`: assistant-operated booking renderer with source evidence checks. Victoria supplies the chart/conversation as usual; the assistant prepares its input and runs it. See `skills/clinic-visit/references/booking-workflow.md`.
- `exam-builder.html`: lumbar, cervical and shoulder review scaffolds with native null deletion, nested choices and the three supplied detailed macros. The assistant fills supported findings; the optional browser view resolves remaining choices. No automatic normal findings or browser persistence.
- `scripts/render_exam.cjs`: source-backed review/final exam renderer and optional prefilled HTML export. `--chart` replaces only the named examination section after final checks. See `skills/clinic-visit/references/exam-workflow.md`.
- `WORKFLOW-PREFERENCES.md`: latest approved drafting, formatting and billing-review preferences; takes precedence over older references.
- `skills/clinic-visit/`: one clinical-note skill for chart prep, new consults, follow-ups, procedures and review. Detailed consult and follow-up references remain together here.
- `skills/referral-letter/`: brief external and Dr. Holowaty referral letters.
- `Pain-Consult-Partner.md`: legacy consult reference, with patient-specific worked examples removed; current preferences and the unified skill take precedence.
- `PUBLICATION.md`: instructions and verification checklist for updating the existing ChatGPT plugin.

## Plugin update bundle

Run `python scripts/build_plugin_bundle.py` to create `dist/pain-partner-update.zip`. The bundle includes both skills, shared preferences and an identical copy of the separate HTML master. Edit the root HTML and rebuild; do not maintain a second builder independently.

The ZIP is a portable source handoff, not an assumed plugin import format. Use the existing plugin editor's supported publishing mechanism. GitHub and bundle updates alone do not change the installed plugin.

The procedure builder supplies a draft for clinician review. Patient-specific facts override template defaults. Some formatting preferences are applied during note assembly and are not yet incorporated into every HTML output setting.

Embedded JavaScript has been syntax-checked; end-to-end browser generation has not yet been verified. GitHub storage does not automatically update the ChatGPT cloud plugin.

## Booking workflow

The assistant reads the supplied records, prepares source-backed structured input outside this repository, and runs `node scripts/render_booking.cjs` following the booking reference. The browser is optional for editing/preview; Victoria is not expected to complete it. The procedure-note builder remains separate. Unreviewed medication status differs from reviewed absence, known drugs are retained, and unresolved clinical decisions prevent generation. The approved single-appointment anticoagulant template retains both weekday branches. Multiple appointments require a plan covering the whole sequence if interruption is needed.

The assistant performs extraction; the renderer does not call an LLM or reinterpret records. It checks declared source evidence and emits fixed text only when the required fields and decisions are resolved. The result must be returned unchanged. It cannot prove that a quoted sentence supports the assistant's interpretation or that a clinical plan is suitable. A local CLI and a disabled browser Copy button do not prevent a chat model from bypassing them.

Each appointment has its own procedures, duration and steroid choice. Scheduling distinguishes separate days, consecutive days, same-day appointments and explicit custom arrangements. Conditional treatment names the earlier diagnostic appointment and the clinician's condition; it is not automatically authorized by reserving a slot. Phenol instructions come from shared preferences. Platelet lines appear only for documented counts below 100 ×10⁹/L; this is a display threshold, not a safe-to-proceed threshold. No drug-specific interruption interval is calculated.

Canonical wording is embedded from `WORKFLOW-PREFERENCES.md`, and the engine from `scripts/booking_engine.cjs`, by `python scripts/build_booking_builder.py`. Do not hand-edit generated script payloads in the HTML. Run `python scripts/build_booking_builder.py --check` to detect stale copies. Run `node scripts/test_booking_builder.cjs` and `node scripts/test_booking_cli.cjs` for synthetic engine/source-check tests. Browser interactions and responsive layout are tested by `node scripts/test_booking_browser.cjs` (requires Playwright and Chromium; set `CHROMIUM_PATH` when needed). These browser checks cover booking, not the separate procedure-note builder.

Commit and push approved changes to preserve them beyond temporary workspaces. Do not commit patient notes, uploads or credentials.

## Examination builder

Edit review templates in the `exam-catalog` JSON payload of `exam-builder.html`. Normal shorthand definitions remain in the physical-exam reference; a larger review scaffold does not authorize unperformed tests. Rebuild embedded code/policy receipts with `python scripts/build_exam_builder.py` after engine or policy edits. Build the booking HTML too after shared preference changes, then run `python scripts/build_plugin_bundle.py`.

Validation: `node scripts/test_exam_engine.cjs`, `node scripts/test_exam_cli.cjs`, and `node scripts/test_exam_browser.cjs` (Playwright/Chromium). These cover nested null deletion, unchanged unresolved choices, explicit support/confirmation, native brace preservation, source receipts, script-safe prefilled HTML, exact exam-section replacement and responsive browser interaction. Curly-brace semantics and unspecified detailed macros remain unresolved; no inference is made about them. Source receipts prove traceability, not clinical interpretation.
