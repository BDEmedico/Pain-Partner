# Existing Pain Partner plugin update

Target the existing personal plugin: https://chatgpt.com/plugins/Plugin_fe83fb96b1bc8191b056547be75b96ec

## Intended contents

- `clinic-visit`: one unified skill for prep, new consults, follow-ups, procedures and review. Keep its existing identifier to avoid breaking references.
- `referral-letter`: retain brief external and Dr. Holowaty referral workflows.
- Remove the separate installed `follow-up-visit` skill after replacing it with the unified clinic skill. Its detailed workflow is now a reference under the unified skill.
- Include the current HTML as a resource of the clinical skill. The editable master remains `procedure-note-builder.html` at repository root. Bundle copies are generated, not independently edited.
- Include shared preferences with each skill so they do not depend on this workspace or a separate GitHub retrieval.

## Build

Run `python scripts/build_plugin_bundle.py`. It writes `dist/pain-partner-update.zip` and checks hashes, resource copies and ZIP integrity. This is a portable source handoff, not a claim that an undocumented plugin ZIP-import format is supported.

## Publication status

The available session tools can list/read installed skills but cannot edit or publish this plugin. GitHub upload and bundle creation therefore do not update the installed plugin. No new duplicate plugin should be created.

When the existing plugin's editor/publisher is available, replace its skill sources and resources with this bundle using that editor's supported mechanism, publish/update the existing plugin, and verify in a new chat that:

1. The clinic skill description covers both new and returning patients.
2. No separate follow-up skill remains active.
3. The shared preferences include correspondence exclusions, compact sections, prior-procedure abbreviations, previous exam retention and billing checks.
4. The clinical skill can read the bundled HTML and its current blood-aspiration wording.
5. The referral skill still follows the dedicated Dr. Holowaty format.

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
