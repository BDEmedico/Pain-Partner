# Assistant-operated booking drafting

Use this workflow when a booking handoff is due under section 7 of current preferences, or when Victoria asks for booking instructions. The assistant reads the actual encounter sources, extracts the supported facts and clinician-selected plan, and runs the local renderer. Victoria does not need to enter a form or construct JSON. The browser page remains an optional preview/editor.

Read repository `WORKFLOW-PREFERENCES.md`, or bundled `references/preferences.md`, first. Read the actual `booking-builder.html` template payload and applicable engine rules for this case. Repository paths below use `scripts/`; in the portable skill, use the skill-local `scripts/`, `assets/booking-builder.html` and `references/preferences.md`.

## Execution

1. Read the full supplied chart, transcript, corrections and medication/laboratory material. Resolve identity and material conflicts; do not treat dispensing as confirmed current use. Decide which sources contain actual clinician instructions. A transcript's plan is not a clinician instruction merely because an AI summary calls it approved.
2. Extract a local JSON packet with the state, source-file hashes and exact evidence quotes described below. This is manual assistant extraction; the renderer does not transcribe, call an LLM, infer source meaning or choose clinical management. Keep encounter files, packet and output in temporary/private storage outside the repository and installed skill directory.
3. Apply only the fixed drafting defaults below. Explicit patient-specific facts and instructions override them. Obtain an actual clinician decision for unresolved management, low-platelet decisions or conditional treatment. Source text saying only `approved`, a generated assertion or a checked review flag cannot supply that decision.
4. Check every extraction against its cited source and all other supplied material. Set `state.reviewed: true` when the **drafting assistant** has reviewed the facts and selected plan. Medication `reviewed: true` similarly means the assistant reviewed that source-backed plan; these flags do not assert that Victoria performed a new final review.
5. Run the renderer. With Node.js available:

   ```sh
   node scripts/render_booking.cjs --input /tmp/booking-packet.json --output /tmp/booking.txt
   ```

   It locates the repository or bundled HTML and preferences automatically. Explicit paths are supported with `--html FILE --preferences FILE`. Without `--output`, success writes booking text alone to stdout. The actual embedded HTML engine is evaluated locally with its canonical templates; it must match the adjacent `booking_engine.cjs`. The preferences SHA-256 must also match the template payload. Rebuild stale software/templates before using them; do not edit a checksum to bypass the check.
6. A nonzero exit or stderr issue means **no new booking was issued**. Fix the source/extraction/plan problem and rerun. The renderer leaves any pre-existing output file unchanged on failure: never deliver that older file as a successful new run. Success replaces the requested output atomically with private file permissions. Re-run after every source, state or plan change.
7. Read the successful output once against the sources and preserve it verbatim in the handoff. For the selected two-day anticoagulant plan with an unknown booking day, also run `verify_booking_output.py` as required by the clinic skill. Do not claim a script ran unless it actually ran. Neither a renderer pass nor wording-verifier pass establishes clinical appropriateness, source completeness, patient identity or authenticity.

No booking is sent, ordered, prescribed or transmitted. This workflow has no server or external model call. The assistant still performs the source interpretation and clinical review required by the preferences. If execution is unavailable, say so and follow the source-based manual workflow; do not claim the deterministic gate ran.

## Packet schema

The top-level JSON object contains:

| Field | Meaning |
| --- | --- |
| `state` | Supported facts and the selected plan using the engine fields below. |
| `sources` | Array of `{ "id", "path", "sha256", "role" }`. `path` is local, absolute or relative to the packet. Hash the exact file bytes, not the quote. `role` defaults to `record`; use `clinician_instruction` only when that actual source contains clinician instructions. |
| `evidence` | Array of `{ "field", "sourceId", "quote" }`. `quote` must be a nonempty, exact substring of the hashed source. A quote can support several separately mapped fields. |
| `approvedDefaults` | Array of `{ "field", "rule" }` with only the fixed rules below. Optional when no default is used. |

Compute source digests from the actual files, for example `sha256sum /tmp/current-transcript.txt`. For PDFs, images or other binary originals, read them first and use a faithful local text extraction as the quoted file; retain source provenance during assistant review. The CLI checks the text extraction's bytes and quotes, not its fidelity to the original. Do not quote a newly generated approval statement as if it were clinician-supplied material.

The checker confirms local file integrity, exact quote inclusion and required evidence fields. It **cannot establish authorship, quote-to-field meaning, completeness, chronology, absence of undocumented drugs or clinical suitability**. Declaring a source role does not prove that role. The assistant must verify those matters and must not use an unrelated exact quote to satisfy a missing fact or decision.

The state shape is:

```json
{
  "appointments": [
    {
      "procedures": [{"kind": "sij", "side": "RIGHT", "guidance": "US", "targets": ""}],
      "duration": 30,
      "steroid": "no",
      "purpose": "routine",
      "dependsOn": null,
      "condition": ""
    }
  ],
  "scheduling": {"mode": "", "instructions": ""},
  "ac": {"status": "no", "drugs": [], "plan": "auto", "custom": "", "reviewed": false},
  "ap": {"status": "no", "drugs": [], "plan": "", "custom": "", "reviewed": false},
  "platelets": {"status": "unavailable", "count": "", "date": "", "decision": ""},
  "ativan": "ask",
  "phenolPronoun": "them",
  "reviewed": true
}
```

This is an illustrative **synthetic state**, not a complete evidence packet or a default patient plan. Use the current engine `catalog` for supported procedure kinds. Guidance is `Fluoro`, `US` or `Landmark`; side is `LEFT`, `RIGHT`, `B/L` or `MIDLINE`. Targets come from the source, never the catalog. Purpose is `routine`, `diagnostic` or `treatment`; diagnostic appointments require `steroid: "no"`. Steroid is explicitly `yes` or `no`.

Each appointment has its own procedure array, duration, steroid choice and purpose. `dependsOn` is null or the **1-based number of a strictly earlier appointment**. A dependency needs its actual clinician-selected `condition`; it stays conditional in the output and requires Dr. Tian review before proceeding. For multiple appointments, `scheduling.mode` is `separate_days`, `consecutive_days`, `same_day` or `custom`; custom requires `instructions`. Preserve actual scheduling/logistical instructions in `instructions`. Do not change separate days into consecutive days. Do not infer an appointment date or weekday.

Legacy packets may use top-level `procedures`, `duration` and `steroid` instead of `appointments` for one appointment. Avoid mixing those two representations. Evidence/default paths then omit the `appointments.0.` prefix.

Medication status is `no`, `undocumented`, `yes`, or AP-only `asa_only`; unresolved `unreviewed`/`conflict` blocks output. `drugs` lists known applicable drugs and cannot remain populated beside a negative status. ASA-only refers only to the non-ASA booking field; it does not remove ASA from the medical record. AC plan is `auto`, `continue`, `two_day` or `custom`; AP plan is `continue`, `seven_day` or `custom`. Explicit plans require source-backed clinician instructions and `reviewed: true`. `two_day` is a specifically selected single-appointment schedule; multi-appointment anticoagulation needs a clinician-selected individualized plan covering the whole sequence. `seven_day` is restricted to clopidogrel. Custom anticoagulant text requires completed `Last dose:`, `No doses:` and `Restart:` lines.

Platelets status is `unavailable` or `available`. For an available result, retain the actual `count` and any supplied `date` (`YYYY-MM-DD`); a blank date or `date not supplied` does not invent one. Count below 100 needs `decision: "proceed"`, `"cbc"` or `"defer"` with a quoted clinician decision; `defer` blocks issue. The presentation omits the platelet row when the count is at least 100 or unavailable. This display rule is not a safe-procedure threshold. An explicit CBC decision still appears and needs clinician-instruction evidence at any count/availability.

Ativan is `ask`, `no` or `requested`, never a prescription. Phenol uses only the two canonical logistics paragraphs, with `phenolPronoun` set to `her`, `him` or `them`; the neutral default is `them`.

## Required evidence paths

Array positions in evidence paths are **zero-based**; the appointment dependency value remains **1-based**.

| State field | Required evidence |
| --- | --- |
| `appointments.0.procedures.0` | Exact quote supporting that complete procedure: kind, side, guidance and actual targets. Alternatively cite each `.kind`, `.side`, `.guidance` and nonempty `.targets` individually. Repeat for every procedure in every appointment. |
| `appointments.0.steroid` | Evidence for the stated steroid choice. |
| `appointments.0.duration` | Clinician instruction when not using the 30-minute default. |
| `appointments.0.purpose` | Evidence when purpose is `diagnostic` or `treatment`; `routine` adds no diagnostic/treatment assertion. |
| `appointments.1.dependsOn`, `appointments.1.condition` | Clinician-instruction quote for each dependency and its condition. |
| `scheduling.mode`, `scheduling.instructions` | Clinician instructions for the multi-appointment mode and any nonempty instructions. |
| `ac.status`, `ap.status` | Source evidence for every status. `undocumented` cites reviewed medication material plus its approved default; it is a review conclusion, not proof of absence. |
| `ac.drugs`, `ap.drugs` | Quote covering all known drugs, or individual `ac.drugs.0` etc. |
| `ac.plan`, `ap.plan` | Exact clinician instruction for an explicit plan. AC `auto` uses the narrowly allowed continuation default and the engine's procedure rules. |
| `ac.custom`, `ap.custom` | Exact clinician instructions supporting the complete individualized plan, in addition to its plan-selection evidence. |
| `platelets.status`, `platelets.count`, `platelets.date` | Availability review evidence; actual count when available; actual date evidence only when supplied. |
| `platelets.decision` | Exact clinician instruction for a count below 100, or any `cbc` decision. |
| `ativan` | Evidence unless using `ativan_ask`. |
| `phenolPronoun` | Evidence for `her`/`him`; neutral `them` needs no inferred demographic fact. |

For example, `{ "field": "ac.plan", "sourceId": "current-instructions", "quote": "Continue edoxaban for the SIJ injection." }` needs a matching exact quote in a hash-verified source whose role is `clinician_instruction`. An evidence quote containing just `approved` is rejected. The role and quote structure still do not prove that the instruction is appropriate for the actual patient.

Only these default entries are accepted:

| `rule` | Allowed field/value |
| --- | --- |
| `duration_30` | `duration` or `appointments.N.duration`, numeric `30`. |
| `ativan_ask` | `ativan: "ask"`. |
| `reviewed_undocumented_medication` | `ac.status` or `ap.status`, value `undocumented`; source-review evidence remains mandatory. |
| `clinic_anticoagulant_continuation` | `ac.plan: "auto"`; only accepted output when the current engine's procedure rule permits continuation. |

There is no general `approved` default, no default hold interval, no default low-platelet decision, and no default conditional-treatment authorization. Required evidence/engine failures go to stderr with a nonzero exit; the CLI never emits a partially resolved booking draft as successful output.
