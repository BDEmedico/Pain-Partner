# Narrow procedure-note verifier

Run **after** the drafting agent has read the previous note, current dictation/corrections, applicable HTML entries and shared generator logic, and authoritative preferences. Run again after repairing any failure. The verifier never rewrites an otherwise acceptable note.

```sh
python scripts/verify_procedure_note.py --note /tmp/encounter/draft.txt --manifest /tmp/encounter/review.json
python -m unittest discover -s scripts -p 'test_verify_procedure_note.py' -v
```

`PASS` and exit code 0 mean the declared mechanical checks passed and evidence-linked semantic review attestations exist for this exact draft. All other statuses return exit code 1. Patient files and manifests stay **outside this repository**. Do not add them to the bundle or commit them. Test fixtures are synthetic and generated in temporary directories.

## What this can and cannot establish

This is a **declared-fact checker**, not an independent clinical reader. It verifies file hashes, quoted evidence, declared carry-forward sections/items, draft shape, exact paragraph duplication, selected vague examination phrases, target wording, declared side/level consistency and dose/dilution arithmetic. It requires four semantic reviews but cannot verify that those reviews were thoughtful or accurate.

A hash receipt demonstrates that a source exists and has not changed. A `read: true` flag and quoted anchor are an attestation of reading, **not proof that the agent read or understood it**. A manifest can omit a fact or declare a wrong fact. Presence of a historical chart section is not proof that its contents were fully carried forward. Anatomical reasoning, subtle contradictions, sentence-level redundancy and invented findings remain semantic-review responsibilities. A wrong dose consistently copied into both note and manifest may pass. Never describe `PASS` as proof of clinical correctness or performed care, or as an independent second clinical opinion.

The CLI fails closed when invoked with incomplete review inputs. It **cannot force a chat host to invoke it or prevent the host from sending a reply**. Do not claim a host-enforced delivery gate exists. If execution is unavailable, do the semantic review and disclose that automated verification did not run.

## Manifest, version 1

Use exact source/HTML snippets. Paths are absolute or relative to the manifest file. `note_sha256` is SHA-256 of the exact UTF-8 note file bytes. A changed draft invalidates both the overall receipt and each review.

```json
{
  "version": 1,
  "note_sha256": "SHA256_OF_FINAL_DRAFT",
  "sources": [
    {
      "id": "prior",
      "role": "previous_note",
      "path": "previous.txt",
      "sha256": "SHA256_OF_FILE",
      "read": true,
      "anchors": ["Exact relevant source text"]
    }
  ],
  "required_sections": ["MEDICAL HISTORY", "CURRENT MEDICATIONS", "ALLERGIES", "INVESTIGATIONS", "PAIN HISTORY", "INTERIM HISTORY", "Previous EXAM", "IMPRESSION", "PLAN"],
  "carry_forward": [
    {"source_id": "prior", "quote": "Exact relevant source text", "note_quote": "Exact resulting note text"}
  ],
  "procedure_start": "Procedure performed:",
  "procedures": [
    {
      "id": "left_l5",
      "template_source": "html",
      "template_entry": "lumbar_root_sequence",
      "shared_logic_anchors": ["function consentParagraph()", "AFTERCARE_DEFAULT"],
      "side": "LEFT",
      "levels": ["L5"],
      "note_anchor": "Procedure performed:",
      "expected_text": ["selective nerve root block"],
      "forbidden_text": ["TFESI"],
      "evidence": [{"source_id": "dictation", "quote": "Exact procedure decision"}]
    }
  ],
  "drugs": [
    {
      "id": "bupivacaine",
      "components": [{"volume_ml": 0.5, "concentration_percent": 0.5}],
      "final_volume_ml": 0.5,
      "final_concentration_percent": 0.5,
      "total_mg": 2.5,
      "note_anchor": "Injectate:",
      "expected_text": ["0.5 cc bupivacaine 0.5%"],
      "evidence": [{"source_id": "dictation", "quote": "Exact administered volume"}, {"source_id": "html", "quote": "Exact applicable default concentration"}]
    }
  ],
  "expected_text": ["Encounter-specific statement that must remain"],
  "forbidden_text": ["Encounter-specific statement contradicted by the dictation"],
  "reviews": {
    "source_completeness": {
      "status": "complete",
      "note_sha256": "SHA256_OF_FINAL_DRAFT",
      "evidence": [{"source_id": "prior", "quote": "Exact source fact", "note_quote": "Exact note fact"}]
    },
    "exam_fidelity": {
      "status": "complete",
      "note_sha256": "SHA256_OF_FINAL_DRAFT",
      "evidence": [{"source_id": "prior", "quote": "Exact historical exam finding", "note_quote": "Exact labelled historical exam wording"}]
    },
    "dictated_exceptions": {
      "status": "complete",
      "note_sha256": "SHA256_OF_FINAL_DRAFT",
      "evidence": [{"source_id": "dictation", "quote": "Exact exception", "note_quote": "Exact preserved exception"}]
    },
    "clinical_consistency": {
      "status": "complete",
      "note_sha256": "SHA256_OF_FINAL_DRAFT",
      "evidence": [{"source_id": "dictation", "quote": "Exact decision", "note_quote": "Exact corresponding plan"}]
    }
  }
}
```

The sample is a schema guide, not a runnable clinical manifest: it omits the additional source receipts and uses placeholder hashes/quotes. Add receipts for encounter `dictation`, applicable `template` and authoritative `preferences` (all required). Add `previous_note` whenever one exists, plus relevant `other` sources. Do not omit supplied sources to obtain a pass. The `carry_forward` ledger is required for a previous-note encounter and should include all established facts/sections that matter, including age, medical/surgical history, medication discrepancies, allergies, imaging and historical exam—not merely one convenient fact. An intentionally omitted/superseded item may use a nonempty `omitted_reason` instead of `note_quote`; clinically material omissions still require judgment.

Each procedure's `note_anchor` must occur **exactly once** and identifies the paragraph from that marker to the next blank line. Keep target-specific fields in target-specific paragraphs when needed; no standalone target headings. Side values are `LEFT`, `RIGHT`, `BILATERAL`, `MIDLINE`. Levels are exact supported strings; an empty list is appropriate for nonspinal targets. The script allows hyphen, en dash or slash separators. It does not infer the anatomical target or resolve root-versus-joint numbering. Use separate procedure objects when side or levels differ.

Each drug object represents **one active agent** and its administered mixture, including saline components at concentration zero. Do not add lidocaine and bupivacaine milligrams together as if they were the same agent. Use `concentration_mg_ml` for steroids instead of `concentration_percent`. Arithmetic checks mass and volume; `expected_text` binds those declarations to actual wording. Declare administered aliquots, not the whole prepared syringe if some was discarded. Check total exposure across all sites in the semantic clinical-consistency review. The CLI does not evaluate toxic-dose limits, renal dosing, contraindications or whether a steroid should be used.

For a documented complication, declare both the finding in `expected_text` and contradictory defaults in `forbidden_text` (for example, `Complications: None.`). Preserve limited access in the narrative without automatically changing a clinician-confirmed procedure title to “attempted.” A missing semantic-review status or stale evidence must be repaired before reporting a pass.

## Regression coverage

The suite includes ordinary, technically limited and combined procedure drafts, plus deliberate failures for omitted history, absent carry-forward review, unread/stale/missing HTML, absent shared logic, forbidden headings, vague motor wording, wrong side/level, dose text/arithmetic mismatches, mistaken dilution, impossible volume, complication/default conflicts, known allergy override, missing semantic review, stale draft, missing source evidence and paragraph duplication. Passing these synthetic cases is evidence of those checks working; it is **not a measured clinical error rate**.
