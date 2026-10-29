#!/usr/bin/env python3
"""Offline draft checks; a PASS is not validation of clinical truth or signed care."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path
import sys

REVIEW_NAMES = ("source_completeness", "exam_fidelity", "dictated_exceptions", "clinical_consistency")
VAGUE_EXAM = (
    "strength preserved", "preserved on testing", "tested lower-limb distributions",
    "tested distributions", "positional and provocative manoeuvres",
    "positional and provocative maneuvers",
)
FORBIDDEN_PROCEDURE_HEADINGS = (
    "PROCEDURE", "PROCEDURES", "PROCEDURE NOTE", "CONSENT AND PREPARATION",
    "INJECTATE", "COMPLICATIONS", "TECHNICAL LIMITATION", "TECHNICAL LIMITATIONS",
)
VALID_ROLES = {"previous_note", "dictation", "template", "preferences", "other"}
LIMITATION = (
    "Machine checks and evidence-linked review attestations passed. This does not prove "
    "that sources were understood, manifest facts are clinically correct, all omissions were "
    "found, or care occurred. This is not independent clinical validation."
)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compact(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().casefold()


def section_present(note: str, label: str) -> bool:
    wanted = compact(label).rstrip(":")
    return any(compact(line).rstrip(":") == wanted or compact(line).startswith(wanted + ":")
               for line in note.splitlines())


def anchor_block(note: str, anchor: str) -> str | None:
    """A marker identifies one paragraph; fields are then checked within that paragraph."""
    if not isinstance(anchor, str) or not anchor or note.count(anchor) != 1:
        return None
    start = note.index(anchor)
    end = note.find("\n\n", start)
    return note[start:end if end >= 0 else len(note)]


def _verify(note_path: Path, manifest_path: Path) -> dict:
    errors: list[dict] = []
    checked: list[str] = []

    def fail(code: str, message: str) -> None:
        errors.append({"code": code, "message": message})

    try:
        note_bytes = note_path.read_bytes()
        note = note_bytes.decode("utf-8")
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, ValueError) as exc:
        return {"status": "INCOMPLETE", "errors": [{"code": "input", "message": str(exc)}]}
    if not isinstance(data, dict):
        return {"status": "INCOMPLETE", "errors": [{"code": "manifest", "message": "Manifest must be an object."}]}
    if data.get("version") != 1:
        fail("manifest_version", "Expected manifest version 1.")
    note_hash = digest(note_bytes)
    if data.get("note_sha256") != note_hash:
        fail("stale_note", "The reviewed note hash does not match this draft; repeat review after edits.")
    checked.append("exact draft hash")

    sources: dict[str, str] = {}
    receipts: dict[str, dict] = {}
    source_list = data.get("sources")
    if not isinstance(source_list, list) or not source_list:
        fail("sources_missing", "Source receipts are required.")
        source_list = []
    for item in source_list:
        if not isinstance(item, dict):
            fail("source_schema", "Each source receipt must be an object.")
            continue
        sid = item.get("id")
        if not isinstance(sid, str) or not sid or sid in receipts:
            fail("source_id", "Source IDs must be nonempty and unique.")
            continue
        receipts[sid] = item
        if item.get("role") not in VALID_ROLES:
            fail("source_role", f"{sid}: invalid source role.")
        if item.get("read") is not True:
            fail("source_unread", f"{sid}: source reading has not been attested.")
        try:
            path = Path(item["path"])
            if not path.is_absolute():
                path = manifest_path.parent / path
            raw = path.read_bytes()
            source_text = raw.decode("utf-8")
        except (OSError, UnicodeError, TypeError, KeyError) as exc:
            fail("source_unavailable", f"{sid}: {exc}")
            continue
        sources[sid] = source_text
        if item.get("sha256") != digest(raw):
            fail("stale_source", f"{sid}: source changed or receipt hash is wrong.")
        anchors = item.get("anchors")
        if not isinstance(anchors, list) or not anchors:
            fail("source_anchors", f"{sid}: at least one exact read anchor is required.")
        else:
            for quote in anchors:
                if not isinstance(quote, str) or not quote.strip() or quote not in source_text:
                    fail("source_anchor_missing", f"{sid}: a declared read anchor was not found.")
    if not any(x.get("role") == "dictation" for x in receipts.values()):
        fail("dictation_missing", "An encounter dictation/correction receipt is required.")
    if not any(x.get("role") == "preferences" for x in receipts.values()):
        fail("preferences_missing", "The authoritative preferences receipt is required.")
    checked.append("source hashes, reading attestations and quoted anchors")

    def evidence(items, label: str, require_note: bool = False) -> None:
        if not isinstance(items, list) or not items:
            fail("evidence_missing", f"{label}: evidence is required.")
            return
        for item in items:
            if not isinstance(item, dict):
                fail("evidence_schema", f"{label}: evidence must be an object.")
                continue
            sid = item.get("source_id")
            source = sources.get(sid, "") if isinstance(sid, str) else ""
            quote = item.get("quote")
            if not isinstance(quote, str) or not quote.strip() or quote not in source:
                fail("evidence_source", f"{label}: source quote not found in its receipted source.")
            note_quote = item.get("note_quote")
            if note_quote is not None:
                if not isinstance(note_quote, str) or not note_quote.strip() or note_quote not in note:
                    fail("evidence_note", f"{label}: reviewed wording no longer occurs in this note.")
            elif require_note and not isinstance(item.get("omitted_reason"), str):
                fail("evidence_disposition", f"{label}: provide note_quote or an explicit omitted_reason.")
            elif require_note and not item.get("omitted_reason", "").strip():
                fail("evidence_disposition", f"{label}: omitted_reason cannot be empty.")

    required = data.get("required_sections")
    if not isinstance(required, list) or not required:
        fail("sections_missing", "List the chart sections that must carry forward.")
    else:
        for label in required:
            if not isinstance(label, str) or not label.strip() or not section_present(note, label):
                fail("missing_section", f"Missing required chart section: {label!r}.")
    carry = data.get("carry_forward")
    if any(x.get("role") == "previous_note" for x in receipts.values()):
        evidence(carry, "carry_forward", require_note=True)
    checked.append("required sections and declared carry-forward items")

    for phrase in VAGUE_EXAM:
        if phrase in compact(note):
            fail("vague_exam", f"Replace vague examination wording: {phrase!r}; preserve only supported findings.")
    seen: set[str] = set()
    for paragraph in re.split(r"\n\s*\n", note):
        normalized = compact(paragraph)
        if len(normalized) >= 70:
            if normalized in seen:
                fail("repeated_paragraph", "An identical substantial paragraph appears more than once.")
            seen.add(normalized)

    marker = data.get("procedure_start", "Procedure performed:")
    if not isinstance(marker, str) or note.count(marker) != 1:
        fail("procedure_boundary", "The procedure_start marker must occur exactly once.")
        procedure_text = ""
    else:
        procedure_text = note[note.index(marker):]
        plan = re.search(r"(?m)^PLAN\s*:?\s*$", procedure_text)
        if plan:
            procedure_text = procedure_text[:plan.start()]
    for line in note.splitlines():
        trimmed = line.strip()
        if trimmed.rstrip(":") in FORBIDDEN_PROCEDURE_HEADINGS:
            fail("procedure_heading", f"Use the approved prose/field format instead of standalone heading: {trimmed}")
    for line in procedure_text.splitlines():
        trimmed = line.strip()
        if re.match(r"^(?:Right|Left|Bilateral|RIGHT|LEFT|BILATERAL)\b.{0,90}:$", trimmed):
            fail("target_heading", f"Remove standalone target heading; retain the target in its paragraph: {trimmed}")
    checked.append("procedure layout, vague examination wording and repeated paragraphs")

    procedures = data.get("procedures")
    if not isinstance(procedures, list) or not procedures:
        fail("procedures_missing", "Declare each performed procedure and its template receipt.")
        procedures = []
    for item in procedures:
        if not isinstance(item, dict):
            fail("procedure_schema", "Each procedure must be an object.")
            continue
        pid = str(item.get("id", "procedure"))
        template_id = item.get("template_source")
        if not isinstance(template_id, str):
            template_id = ""
        template = sources.get(template_id, "")
        if receipts.get(template_id, {}).get("role") != "template":
            fail("template_missing", f"{pid}: no applicable HTML template receipt.")
        entry = item.get("template_entry")
        if not isinstance(entry, str) or not re.search(r"\b" + re.escape(entry or "") + r"\s*:\s*\{", template):
            fail("template_entry", f"{pid}: selected template entry not found.")
        shared = item.get("shared_logic_anchors")
        if not isinstance(shared, list) or not shared or any(not isinstance(a, str) or not a.strip() or a not in template for a in shared):
            fail("template_shared_logic", f"{pid}: exact shared generation-logic anchors required.")
        evidence(item.get("evidence"), pid)
        block = anchor_block(note, item.get("note_anchor", ""))
        if block is None:
            fail("procedure_anchor", f"{pid}: note_anchor must identify exactly one procedure paragraph.")
            continue
        side = item.get("side")
        if side not in ("LEFT", "RIGHT", "BILATERAL", "MIDLINE"):
            fail("side_schema", f"{pid}: specify LEFT, RIGHT, BILATERAL or MIDLINE.")
        elif side != "MIDLINE":
            found_sides = set(re.findall(r"\b(?:left|right|bilateral|b/l)\b", block, flags=re.I))
            found_sides = {"BILATERAL" if s.upper() == "B/L" else s.upper() for s in found_sides}
            if side not in found_sides or (side in ("LEFT", "RIGHT") and found_sides - {side}):
                fail("laterality", f"{pid}: declared side {side} does not match its procedure paragraph.")
        levels = item.get("levels")
        if not isinstance(levels, list):
            fail("levels_schema", f"{pid}: levels must be a list (empty for nonspinal targets).")
        else:
            for level in levels:
                normalized_level = str(level).replace("–", "-").replace("/", "-")
                pattern = re.escape(normalized_level).replace(r"\-", "[-–/]")
                if not re.search(r"(?<![A-Za-z0-9])" + pattern + r"(?![0-9])", block, flags=re.I):
                    fail("level", f"{pid}: expected level {level} absent from its procedure paragraph.")
        for phrase in item.get("expected_text", []):
            if not isinstance(phrase, str) or phrase not in block:
                fail("procedure_expected", f"{pid}: expected wording absent from its procedure paragraph.")
        for phrase in item.get("forbidden_text", []):
            if isinstance(phrase, str) and phrase.casefold() in block.casefold():
                fail("procedure_exception", f"{pid}: wording conflicts with a declared procedural exception: {phrase!r}.")
    checked.append("declared template entry, shared logic, laterality, levels and exceptions")

    drugs = data.get("drugs")
    if not isinstance(drugs, list) or not drugs:
        fail("drugs_missing", "Declare the administered mixtures/doses for arithmetic review.")
        drugs = []
    for item in drugs:
        if not isinstance(item, dict):
            fail("drug_schema", "Each drug record must be an object.")
            continue
        did = str(item.get("id", "drug"))
        evidence(item.get("evidence"), did)
        block = anchor_block(note, item.get("note_anchor", ""))
        if block is None:
            fail("drug_anchor", f"{did}: note_anchor must identify exactly one injectate paragraph.")
        elif not item.get("expected_text"):
            fail("drug_expected", f"{did}: expected_text must link arithmetic to actual note wording.")
        else:
            for phrase in item["expected_text"]:
                if not isinstance(phrase, str) or phrase not in block:
                    fail("dose_note", f"{did}: actual injectate wording does not match declared dose text.")
        try:
            components = item["components"]
            if not isinstance(components, list) or not components:
                raise ValueError("nonempty components required")
            volume = Decimal(0)
            milligrams = Decimal(0)
            for component in components:
                v = Decimal(str(component["volume_ml"]))
                if "concentration_percent" in component:
                    mg_ml = Decimal(str(component["concentration_percent"])) * 10
                else:
                    mg_ml = Decimal(str(component["concentration_mg_ml"]))
                if not v.is_finite() or not mg_ml.is_finite() or v < 0 or mg_ml < 0:
                    raise ValueError("nonnegative finite component quantities required")
                volume += v
                milligrams += v * mg_ml
            declared_volume = Decimal(str(item["final_volume_ml"]))
            declared_mg = Decimal(str(item["total_mg"]))
            if volume <= 0 or not declared_volume.is_finite() or not declared_mg.is_finite():
                raise ValueError("finite quantities and positive total volume required")
            if abs(volume - declared_volume) > Decimal("0.0001"):
                fail("volume_arithmetic", f"{did}: components total {volume} mL, not {declared_volume} mL.")
            if abs(milligrams - declared_mg) > Decimal("0.0001"):
                fail("dose_arithmetic", f"{did}: components contain {milligrams} mg, not {declared_mg} mg.")
            if "final_concentration_percent" in item:
                final = Decimal(str(item["final_concentration_percent"]))
                if not final.is_finite() or abs(final - milligrams / volume / 10) > Decimal("0.0001"):
                    fail("concentration_arithmetic", f"{did}: final concentration should be {milligrams / volume / 10}%.")
        except (KeyError, TypeError, ValueError, InvalidOperation, ZeroDivisionError) as exc:
            fail("drug_schema", f"{did}: invalid arithmetic inputs ({exc}).")
    checked.append("declared injectate arithmetic and corresponding note wording")

    for phrase in data.get("forbidden_text", []):
        if isinstance(phrase, str) and phrase.casefold() in note.casefold():
            fail("exception_conflict", f"Forbidden wording for this encounter: {phrase!r}.")
    for phrase in data.get("expected_text", []):
        if not isinstance(phrase, str) or phrase not in note:
            fail("expected_text", "An expected encounter-specific statement is absent.")

    reviews = data.get("reviews", {})
    if not isinstance(reviews, dict):
        reviews = {}
    for name in REVIEW_NAMES:
        review = reviews.get(name)
        if not isinstance(review, dict) or review.get("status") != "complete":
            fail("review_incomplete", f"{name}: semantic review has not been completed.")
            continue
        if review.get("note_sha256") != note_hash:
            fail("stale_review", f"{name}: attestation refers to a different draft.")
        evidence(review.get("evidence"), name, require_note=True)
    checked.append("semantic review attestations (not independently verified)")
    return {"status": "PASS" if not errors else "NEEDS_REPAIR", "note_sha256": note_hash,
            "checks": checked, "errors": errors, "limitation": LIMITATION if not errors else
            "Repair the listed failures and repeat review. These checks do not establish clinical truth."}


def verify(note_path: Path, manifest_path: Path) -> dict:
    """Malformed structured input fails closed rather than crashing the delivery check."""
    try:
        return _verify(note_path, manifest_path)
    except (TypeError, ValueError, KeyError, AttributeError) as exc:
        return {"status": "INCOMPLETE", "errors": [{"code": "manifest_schema",
                "message": f"Invalid manifest field type or structure: {exc}"}]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--note", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    args = parser.parse_args()
    result = verify(args.note, args.manifest)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
