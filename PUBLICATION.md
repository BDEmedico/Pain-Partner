# Existing Pain Partner plugin update

Target the existing personal plugin: https://chatgpt.com/plugins/Plugin_fe83fb96b1bc8191b056547be75b96ec

## Intended contents

- `clinic-visit`: one unified skill for prep, new consults, follow-ups, procedures and review. Keep its existing identifier to avoid breaking references.
- `referral-letter`: retain brief external and Dr. Holowaty referral workflows.
- Remove the separate installed `follow-up-visit` skill after replacing it with the unified clinic skill. Its detailed workflow is now a reference under the unified skill.
- Include the current HTML as a resource of the clinical skill. The editable master remains `procedure-note-builder.html` at repository root. Bundle copies are generated, not independently edited.
- Include `booking-builder.html`, `scripts/render_booking.cjs` and `references/booking-workflow.md` as clinical-skill resources. The HTML engine and templates are generated from `scripts/booking_engine.cjs` and shared preferences. It does not replace the procedure builder or connect to patient records. Generate it with `python scripts/build_booking_builder.py` before building the bundle. The assistant prepares evidence-backed input; Victoria should not have to fill a form.
- Include shared preferences with each skill so they do not depend on this workspace or a separate GitHub retrieval.

## Build

Run `python scripts/build_plugin_bundle.py`. It writes `dist/pain-partner-update.zip` and checks hashes, resource copies and ZIP integrity. This is a portable source handoff, not a claim that an undocumented plugin ZIP-import format is supported.

## Publication status

Release `2026-11-05` includes a version reference at `clinic-visit/references/release.md` and user-facing invocation examples in the repository README. The release checks cover procedure workflow/verifier integration, booking engine/CLI, examination engine/CLI and synthetic browser interactions for booking and examinations. These checks do not establish clinical correctness or installed-plugin publication.

The available session tools can list/read installed skills but cannot edit or publish this plugin. GitHub upload and bundle creation therefore do not update the installed plugin. No new duplicate plugin should be created.

The current session's cloud-skills catalog was checked during the booking workflow update: Pain Partner is not exposed in that catalog. This does not establish that the user's plugin is uninstalled; its installed source/version cannot be verified from this session. Publication cannot be marked complete until the existing plugin is updated through a supported editor and its resources are checked in a new chat.

When the existing plugin's editor/publisher is available, replace its skill sources and resources with this bundle using that editor's supported mechanism, publish/update the existing plugin, and verify in a new chat that:

1. The clinic skill description covers both new and returning patients.
2. No separate follow-up skill remains active.
3. The shared preferences include correspondence exclusions, compact sections, prior-procedure abbreviations, previous exam retention and billing checks.
4. The clinical skill can read the bundled HTML and its current blood-aspiration wording.
5. The referral skill still follows the dedicated Dr. Holowaty format.
6. The assistant can run the packaged booking renderer with synthetic source-backed input, returns its output unchanged, and does not ask Victoria to fill the form.
7. Multiple appointments, conditional treatment, both weekday examples when selected, and phenol instructions survive generation. Platelet lines are absent at 100 or above and when no count is supplied, and present below 100.

Do not report publication complete until those installed resources have been verified.

## Procedure-workflow repair release

Before publishing, run `bash scripts/check_procedure_workflow.sh`. The portable bundle now includes the narrow verifier executable and schema reference under `clinic-visit`, along with the editable-HTML copy, source-based workflow and synthetic layout candidate.

Update the existing plugin's clinic skill, references and HTML together. Do not install a competing output-review policy. The verifier is a required stage of the clinic skill. Its semantic review consults the same sources and policies.

After publication, verify in a **new chat** that the installed version:
- reads the current HTML entries and shared logic;
- retains the previous complete chart;
- emits inline procedure fields without the old standalone wrapper;
- preserves known allergies and uses the authorized NKDA draft default otherwise;
- can access/run the packaged verifier, or explicitly reports manual review if execution is unavailable.

Do not mark the exact synthetic example visually approved until Victoria accepts it. No tested host-level pre-response hook is available; publication does not make the verifier impossible to skip.

## Remaining reliability boundaries

- The examination bundle now includes `assets/exam-builder.html`, `scripts/exam_engine.cjs`, `scripts/render_exam.cjs` and `references/exam-workflow.md`. Publish these with the updated preferences and physical-exam reference. Verify native null deletion, source-backed prefilling, review versus final output, the three supplied detailed macros and exam-only chart replacement in a new chat. Unspecified curly-brace semantics and missing detailed macros remain unresolved. There is still no cloud-publisher capability in this session; the local bundle is not the installed plugin.

- All local preferences (tone, examination wording, medication choices and attribution), procedure templates, verifiers and booking changes share the publication boundary above. Saving a file is not account-wide memory or installed-plugin publication.
- The booking CLI fails closed when invoked with unresolved fields or missing declared evidence. It cannot force a chat to invoke it, prove source completeness, or establish the clinical meaning of a quote. The chat must continue to compare the declared facts with the real sources.
- The procedure-note verifier also checks declared facts and source receipts; it does not independently validate clinical judgment. Some chart-format rules are applied during note assembly rather than enforced in every procedure-builder setting. The procedure builder's browser flow is separate from booking-browser tests.
- No EMR task is created, medication is prescribed or message is sent by these local tools. Those actions require a separately available, authorized integration.
