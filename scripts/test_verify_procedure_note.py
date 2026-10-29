"""Synthetic regression cases; no patient-derived text or identifiers."""
import copy
import json
from pathlib import Path
import tempfile
import unittest

from verify_procedure_note import digest, verify, REVIEW_NAMES


class ProcedureVerifierTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        self.note_path = self.root / "draft.txt"
        self.manifest_path = self.root / "review.json"
        self.previous = "A 42-year-old adult. Medical history: hypertension. Previous EXAM: Motor: L2–S1 5/5 bilaterally."
        self.dictation = "Perform LEFT L5 root block. Give 0.5 cc bupivacaine 0.5%."
        self.preferences = "Use full chart. Retain abnormalities. No standalone procedure headings."
        self.template = "lumbar_root_sequence: { needle: '22g' }; esp: {}; sij: {}; function consentParagraph() {}; var AFTERCARE_DEFAULT = 'observe';"
        self.note = (
            "A 42-year-old adult returned for follow-up.\n\nMEDICAL HISTORY\nHypertension.\n\n"
            "SURGICAL HISTORY\nNone.\n\n"
            "CURRENT MEDICATIONS: Amlodipine.\n\n"
            "ALLERGIES\nNKDA.\n\n"
            "INVESTIGATIONS\nLumbar degeneration.\n\n"
            "PAIN HISTORY\nLeft leg pain.\n\n"
            "INTERIM HISTORY\nPresents for intervention.\n\n"
            "Previous EXAM\nMotor: L2–S1 5/5 bilaterally.\n\n"
            "IMPRESSION\nLeft radicular pain.\n\n"
            "Procedure performed: Fluoroscopy-guided LEFT L5 selective nerve root block.\n\n"
            "Consent and Preparation: Informed consent obtained.\n\n"
            "The left L5 foramen was approached under fluoroscopy.\n\n"
            "Injectate: 0.5 cc bupivacaine 0.5%, containing 2.5 mg.\n\n"
            "Complications: None.\n\n"
            "PLAN\nReview pain diary.\n"
        )
        self.manifest = {
            "version": 1,
            "sources": [],
            "required_sections": ["MEDICAL HISTORY", "SURGICAL HISTORY", "CURRENT MEDICATIONS", "ALLERGIES", "INVESTIGATIONS", "PAIN HISTORY", "INTERIM HISTORY", "Previous EXAM", "IMPRESSION", "PLAN"],
            "carry_forward": [{"source_id": "prior", "quote": "hypertension", "note_quote": "Hypertension."}, {"source_id": "prior", "quote": "42-year-old adult", "note_quote": "42-year-old adult"}],
            "procedures": [{
                "id": "left_l5", "template_source": "html", "template_entry": "lumbar_root_sequence",
                "shared_logic_anchors": ["function consentParagraph()", "AFTERCARE_DEFAULT"],
                "side": "LEFT", "levels": ["L5"], "note_anchor": "Procedure performed:",
                "evidence": [{"source_id": "dictation", "quote": "Perform LEFT L5 root block."}],
                "expected_text": ["selective nerve root block"],
            }],
            "drugs": [{
                "id": "bupivacaine", "components": [{"volume_ml": 0.5, "concentration_percent": 0.5}],
                "final_volume_ml": 0.5, "final_concentration_percent": 0.5, "total_mg": 2.5,
                "note_anchor": "Injectate:", "expected_text": ["0.5 cc bupivacaine 0.5%", "2.5 mg"],
                "evidence": [{"source_id": "dictation", "quote": "Give 0.5 cc bupivacaine 0.5%."}],
            }],
            "reviews": {},
        }
        for sid, role, content in [("prior", "previous_note", self.previous), ("dictation", "dictation", self.dictation), ("rules", "preferences", self.preferences), ("html", "template", self.template)]:
            path = self.root / (sid + ".txt")
            path.write_text(content)
            self.manifest["sources"].append({"id": sid, "role": role, "path": path.name,
                "sha256": digest(path.read_bytes()), "read": True, "anchors": [content]})
        self.review_again()

    def review_again(self):
        h = digest(self.note.encode())
        self.manifest["note_sha256"] = h
        for name in REVIEW_NAMES:
            self.manifest["reviews"][name] = {"status": "complete", "note_sha256": h,
                "evidence": [{"source_id": "dictation", "quote": "Perform LEFT L5 root block.",
                              "note_quote": "LEFT L5 selective nerve root block"}]}

    def result(self):
        self.note_path.write_text(self.note)
        self.manifest_path.write_text(json.dumps(self.manifest))
        return verify(self.note_path, self.manifest_path)

    def codes(self):
        return {x["code"] for x in self.result()["errors"]}

    def test_standard_passes(self):
        self.assertEqual(self.result()["status"], "PASS")
        self.assertIn("not independent clinical validation", self.result()["limitation"])

    def test_missing_history_fails(self):
        self.note = self.note.replace("SURGICAL HISTORY\nNone.\n\n", "")
        self.review_again()
        self.assertIn("missing_section", self.codes())

    def test_missing_carry_forward_evidence_fails(self):
        self.manifest["carry_forward"] = []
        self.assertIn("evidence_missing", self.codes())

    def test_unused_html_fails(self):
        self.manifest["sources"][-1]["read"] = False
        self.assertIn("source_unread", self.codes())

    def test_missing_template_fails(self):
        self.manifest["procedures"][0]["template_source"] = "prior"
        self.assertIn("template_missing", self.codes())

    def test_stale_template_fails(self):
        (self.root / "html.txt").write_text(self.template + " changed")
        self.assertIn("stale_source", self.codes())

    def test_missing_shared_logic_fails(self):
        self.manifest["procedures"][0]["shared_logic_anchors"] = []
        self.assertIn("template_shared_logic", self.codes())

    def test_age_carry_forward_change_fails(self):
        self.note = self.note.replace("42-year-old", "43-year-old")
        self.review_again()
        self.assertIn("evidence_note", self.codes())

    def test_heading_before_procedure_marker_fails(self):
        self.note = self.note.replace("Procedure performed:", "PROCEDURE NOTE\n\nProcedure performed:")
        self.review_again()
        self.assertIn("procedure_heading", self.codes())

    def test_bad_heading_fails(self):
        self.note = self.note.replace("The left L5", "PROCEDURE NOTE\n\nThe left L5")
        self.review_again()
        self.assertIn("procedure_heading", self.codes())

    def test_approved_template_labels_with_colons_pass(self):
        self.note = self.note.replace("The left L5 foramen", "Preprocedural screen:\nNo active infection.\n\nProcedure note:\nThe left L5 foramen")
        self.note = self.note.replace("Injectate: 0.5 cc", "Injectate:\n0.5 cc")
        self.review_again()
        self.assertEqual(self.result()["status"], "PASS")

    def test_target_heading_fails(self):
        self.note = self.note.replace("The left L5", "Left L5 root block:\nThe left L5")
        self.review_again()
        self.assertIn("target_heading", self.codes())

    def test_vague_exam_fails(self):
        self.note = self.note.replace("Motor: L2–S1 5/5 bilaterally.", "Motor: strength preserved.")
        self.review_again()
        self.assertIn("vague_exam", self.codes())

    def test_wrong_side_fails(self):
        self.note = self.note.replace("guided LEFT", "guided RIGHT")
        self.review_again()
        self.assertIn("laterality", self.codes())

    def test_bilateral_title_abbreviation(self):
        self.note = self.note.replace("Complications: None.", "B/L L4 ESP.\n\nComplications: None.")
        self.manifest["procedures"].append({
            "id": "bilateral_esp", "template_source": "html", "template_entry": "esp",
            "shared_logic_anchors": ["AFTERCARE_DEFAULT"], "side": "BILATERAL",
            "levels": ["L4"], "note_anchor": "B/L L4 ESP.",
            "evidence": [{"source_id": "html", "quote": "esp: {}"}],
        })
        self.review_again()
        self.assertEqual(self.result()["status"], "PASS")
        # B/L must not accidentally satisfy a unilateral declaration.
        self.manifest["procedures"][-1]["side"] = "LEFT"
        self.assertIn("laterality", self.codes())

    def test_wrong_level_fails(self):
        self.note = self.note.replace("LEFT L5 selective", "LEFT L4 selective")
        self.review_again()
        self.assertIn("level", self.codes())

    def test_changed_dose_wording_fails(self):
        self.note = self.note.replace("0.5 cc bupivacaine", "5 cc bupivacaine")
        self.review_again()
        self.assertIn("dose_note", self.codes())

    def test_wrong_dose_arithmetic_fails(self):
        self.manifest["drugs"][0]["total_mg"] = 25
        self.assertIn("dose_arithmetic", self.codes())

    def test_esp_dilution_error_fails(self):
        drug = self.manifest["drugs"][0]
        drug["components"] = [{"volume_ml": 5, "concentration_percent": 0.125}, {"volume_ml": 5, "concentration_percent": 0}]
        drug.update(final_volume_ml=10, total_mg=6.25, final_concentration_percent=0.125)
        self.assertIn("concentration_arithmetic", self.codes())

    def test_impossible_total_volume_fails(self):
        self.manifest["drugs"][0]["final_volume_ml"] = 20
        self.assertIn("volume_arithmetic", self.codes())

    def test_complication_overrides_normal_default(self):
        self.manifest["forbidden_text"] = ["Complications: None.", "discharged home in stable condition"]
        self.manifest["expected_text"] = ["Right leg weakness persisted."]
        self.assertIn("exception_conflict", self.codes())
        self.assertIn("expected_text", self.codes())
        self.note = self.note.replace("Complications: None.", "Right leg weakness persisted. Mobility and disposition require reassessment.")
        self.review_again()
        self.assertEqual(self.result()["status"], "PASS")

    def test_unknown_semantic_review_fails(self):
        self.manifest["reviews"]["exam_fidelity"]["status"] = "unknown"
        self.assertIn("review_incomplete", self.codes())

    def test_changed_note_invalidates_attestation(self):
        self.note += "\nNew plan.\n"
        self.assertIn("stale_note", self.codes())
        self.assertIn("stale_review", self.codes())

    def test_source_quote_must_exist(self):
        self.manifest["reviews"]["source_completeness"]["evidence"][0]["quote"] = "This never appeared."
        self.assertIn("evidence_source", self.codes())

    def test_repeated_paragraph_fails(self):
        paragraph = "The patient described a substantial improvement in function during the anesthetic window."
        self.note += "\n" + paragraph + "\n\n" + paragraph + "\n"
        self.review_again()
        self.assertIn("repeated_paragraph", self.codes())

    def test_limited_block_keeps_title_passes(self):
        addition = "Contrast did not convincingly outline the nerve root. Further attempts stopped when contrast obscured visualization."
        self.note = self.note.replace("The left L5 foramen was approached under fluoroscopy.", addition)
        self.manifest["expected_text"] = [addition]
        self.manifest["forbidden_text"] = ["Contrast confirmed selective perineural spread"]
        self.review_again()
        self.assertEqual(self.result()["status"], "PASS")

    def test_combined_injections_pass(self):
        self.note = self.note.replace("Complications: None.", "The right L4 and L5 transverse processes were targeted for ESP blocks.\n\nESP injectate: 5 cc bupivacaine 0.25% plus 5 cc saline; total 10 cc bupivacaine 0.125%, containing 12.5 mg.\n\nComplications: None.")
        self.manifest["procedures"].append({"id": "right_esp", "template_source": "html", "template_entry": "esp", "shared_logic_anchors": ["AFTERCARE_DEFAULT"], "side": "RIGHT", "levels": ["L4", "L5"], "note_anchor": "The right L4", "evidence": [{"source_id": "html", "quote": "esp: {}"}]})
        self.manifest["drugs"].append({"id": "esp_bupi", "components": [{"volume_ml": 5, "concentration_percent": 0.25}, {"volume_ml": 5, "concentration_percent": 0}], "final_volume_ml": 10, "final_concentration_percent": 0.125, "total_mg": 12.5, "note_anchor": "ESP injectate:", "expected_text": ["5 cc bupivacaine 0.25%", "5 cc saline", "10 cc bupivacaine 0.125%", "12.5 mg"], "evidence": [{"source_id": "html", "quote": "esp: {}"}]})
        self.review_again()
        self.assertEqual(self.result()["status"], "PASS")

    def test_known_allergy_override_checked(self):
        self.manifest["forbidden_text"] = ["NKDA"]
        self.assertIn("exception_conflict", self.codes())

    def test_level_separator_variants_pass(self):
        for label in ("L4-5", "L4–5", "L4/5"):
            with self.subTest(label=label):
                manifest = copy.deepcopy(self.manifest)
                manifest["procedures"][0]["levels"] = [label]
                self.note = self.note.replace("LEFT L5 selective", "LEFT L4–5 selective")
                self.manifest = manifest
                self.review_again()
                for review in self.manifest["reviews"].values():
                    review["evidence"][0]["note_quote"] = "LEFT L4–5 selective nerve root block"
                self.assertEqual(self.result()["status"], "PASS")

    def test_malformed_list_fails_closed(self):
        self.manifest["procedures"][0]["expected_text"] = None
        self.assertEqual(self.result()["status"], "INCOMPLETE")

    def test_invalid_json_is_incomplete(self):
        self.note_path.write_text(self.note)
        self.manifest_path.write_text("{")
        self.assertEqual(verify(self.note_path, self.manifest_path)["status"], "INCOMPLETE")

    def test_nan_dose_fails(self):
        self.manifest["drugs"][0]["total_mg"] = "NaN"
        self.assertIn("drug_schema", self.codes())


if __name__ == "__main__":
    unittest.main()
