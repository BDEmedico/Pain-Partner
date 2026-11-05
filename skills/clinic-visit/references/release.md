# Pain Partner release

Release identifier: `2026-11-05`

This source release contains the unified `clinic-visit` workflow, procedure HTML defaults and source-linked verifier, assistant-operated examination HTML/CLI, assistant-operated booking HTML/CLI and the retained `referral-letter` skill. Shared preferences travel with the bundle.

The assistant reads the supplied chart/dictation, prepares tool input and performs source comparison. Victoria should not have to populate a separate form. Missing or unresolved clinical facts remain explicit; the tools do not establish clinical truth or guarantee that a chat will invoke them.

Suggested chat request:

> Use Pain Partner's clinic-visit workflow. Combine my old chart and new dictation, apply the current HTML defaults and run the procedure-note verifier before returning the completed chart.

For examination-only edits: `Use the exam HTML for this section only.`

For procedure booking: `Use the booking generator to create the MOA task.`

## Availability check

When asked to verify this release, read this resource and check that the procedure HTML, shared preferences, examination renderer, booking renderer and verifier are accessible. Report whether script execution is actually available. Do not claim a generator/verifier ran merely because its source is present.

This identifier records source contents. GitHub storage, bundle creation, installed-plugin publication and enabling the plugin in a new chat are separate states. There is no bundled host-wide enforcement hook or plugin publisher.
