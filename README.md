# Pain Partner

Reusable pain-clinic drafting instructions and a standalone procedure-note builder.

## Files

- `procedure-note-builder.html`: download and open in a browser. Includes the revised blood-aspiration wording, distinct from joint-fluid aspiration.
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

Commit and push approved changes to preserve them beyond temporary workspaces. Do not commit patient notes, uploads or credentials.
