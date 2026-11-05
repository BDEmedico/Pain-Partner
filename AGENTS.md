# Pain Partner working instructions

Read `WORKFLOW-PREFERENCES.md` before drafting or changing clinical workflows. Its latest user-approved preferences take precedence over older bundled references. Use the applicable skill in `skills/` and the current `procedure-note-builder.html` for procedure wording.

Keep patient notes, uploads, identifiers, clinical transcripts, credentials and browser storage exports out of this repository. The repository stores reusable software and instructions only.

For a procedure-booking request, the assistant reads `skills/clinic-visit/references/booking-workflow.md`, prepares the source-backed input and runs `scripts/render_booking.cjs`. Do not ask Victoria to fill the booking form. Resolve actual clinical ambiguities with complete selectable wording, then return generated text unchanged. A failed/missing generator check must not be described as a verified booking. These repository instructions apply only when this workspace is available; they are not a host-wide response gate.

GitHub stores these files durably after a successful push. Editing these files does not publish the ChatGPT cloud plugin. Never claim account-wide plugin updates without verification.
