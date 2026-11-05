"""Synthetic consultation regressions for source-linked exam wording and scope."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from verify_procedure_note import REVIEW_NAMES, digest, verify

ROOT = Path(__file__).resolve().parents[1]
NORMAL = [
    "- Motor: L2–S1 5/5 B/L.",
    "- Sensation: L2–S1 intact to light touch B/L.",
    "- Reflexes: Patellar and Achilles 2+ B/L.",
]


class ConsultationExamReview(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.note_path = self.root / "draft.txt"
        self.manifest_path = self.root / "review.json"
        self.prepare("Lumbar motor, light-touch sensation and patellar/Achilles reflexes normal bilaterally.", NORMAL)

    def prepare(self, source, lines):
        clinical_path = self.root / "dictation.txt"
        clinical_path.write_text(source, encoding="utf-8")
        prefs = ROOT / "WORKFLOW-PREFERENCES.md"
        self.source = source
        self.note = "Consultation\n\nEXAM\n" + "\n".join(lines) + "\n"
        self.manifest = {
            "version": 1,
            "sources": [
                {"id": "clinical", "path": str(clinical_path), "role": "dictation", "read": True,
                 "sha256": digest(clinical_path.read_bytes()), "anchors": [source]},
                {"id": "preferences", "path": str(prefs), "role": "preferences", "read": True,
                 "sha256": digest(prefs.read_bytes()), "anchors": ["Full chart continuity"]},
            ],
            "required_sections": ["EXAM"],
            "exam_findings": [
                {"id": str(i), "note_anchor": "\nEXAM\n", "expected_text": [line],
                 "evidence": [{"source_id": "clinical", "quote": source}]}
                for i, line in enumerate(lines)
            ],
        }

    def save(self):
        # Refresh ordinary review receipts so failures exercise the exam check,
        # rather than merely catching an outdated draft hash or note quotation.
        sha = digest(self.note.encode("utf-8"))
        self.manifest["note_sha256"] = sha
        self.manifest["reviews"] = {
            name: {"status": "complete", "note_sha256": sha, "evidence": [
                {"source_id": "clinical", "quote": self.source, "note_quote": "EXAM"}]}
            for name in REVIEW_NAMES
        }
        self.note_path.write_text(self.note, encoding="utf-8")
        self.manifest_path.write_text(json.dumps(self.manifest), encoding="utf-8")

    def result(self, exam_only=True):
        self.save()
        return verify(self.note_path, self.manifest_path, exam_only=exam_only)

    def assert_failure(self, code):
        result = self.result()
        self.assertNotEqual(result["status"], "PASS", result)
        self.assertIn(code, {e["code"] for e in result["errors"]}, result)

    def test_normal_components_without_a_performed_procedure(self):
        result = self.result()
        self.assertEqual(result["status"], "PASS", result)
        self.assertEqual(result["scope"], "exam_only")
        self.assertIn("drug doses were not checked", result["limitation"])

    def test_normal_reflex_shorthand_cannot_be_downgraded(self):
        for vague in ("normal", "present", "elicited"):
            with self.subTest(vague=vague):
                self.note = "Consultation\n\nEXAM\n" + "\n".join(NORMAL).replace("2+", vague)
                self.assert_failure("exam_expected")

    def test_supported_motor_cannot_be_omitted(self):
        self.note = self.note.replace(NORMAL[0] + "\n", "")
        self.assert_failure("exam_expected")

    def test_supported_sensory_distribution_cannot_be_dropped(self):
        self.note = self.note.replace(NORMAL[1], "- Sensation: Light touch intact B/L.")
        self.assert_failure("exam_expected")

    def test_component_only_confirmation_does_not_require_other_normal_findings(self):
        self.prepare("Patellar and Achilles reflexes normal bilaterally.", [NORMAL[2]])
        self.assertEqual(self.result()["status"], "PASS")
        self.manifest["forbidden_text"] = ["- Hip:", "- SIJ:"]
        self.note += "- Hip: ROM w/o typical pain.\n"
        self.assert_failure("exception_conflict")

    def test_otherwise_normal_macro_preserves_specific_abnormality(self):
        macro = (ROOT / "skills/clinic-visit/references/physical-exam.md").read_text()
        lines = macro.split("## Normal back exam", 1)[1].split("```text\nEXAM\n", 1)[1].split("\n```", 1)[0].splitlines()
        lines[0] = lines[0].replace("5/5 B/L.", "5/5 B/L except left ankle dorsiflexion 4/5.")
        self.prepare("Left ankle dorsiflexion 4/5; otherwise normal back exam.", lines)
        self.assertEqual(self.result()["status"], "PASS")
        self.note = self.note.replace(" except left ankle dorsiflexion 4/5", "")
        self.assert_failure("exam_expected")

    def test_uncertain_test_does_not_dilute_supported_components(self):
        self.prepare("Lumbar motor and sensation normal bilaterally. Hip manoeuvre unclear.", NORMAL[:2])
        self.assertEqual(self.result()["status"], "PASS")
        self.note = self.note.replace(NORMAL[0], "- Motor: Normal.")
        self.assert_failure("exam_expected")

    def test_test_commands_do_not_establish_normal_result(self):
        partial = "- Reflexes: Right patellar reflex elicited; grade not documented."
        self.prepare("Push. Relax. Right patellar reflex elicited; no grade recorded.", [partial])
        self.assertEqual(self.result()["status"], "PASS")
        self.note = self.note.replace(partial, NORMAL[2])
        self.assert_failure("exam_expected")

    def test_historical_finding_cannot_satisfy_current_exam_declaration(self):
        self.note = "Consultation\n\nPrevious EXAM\n" + "\n".join(NORMAL) + "\n\nEXAM\n- Reflexes: Normal.\n"
        self.assert_failure("exam_expected")

    def test_macro_alone_is_not_clinical_evidence(self):
        self.manifest["exam_findings"][0]["evidence"] = [
            {"source_id": "preferences", "quote": "Full chart continuity"}]
        self.assert_failure("exam_source")

    def test_missing_exam_declarations_fail(self):
        del self.manifest["exam_findings"]
        self.assert_failure("exam_findings_missing")

    def test_full_procedure_mode_still_requires_procedure_and_drugs(self):
        result = self.result(exam_only=False)
        self.assertEqual(result["scope"], "full_procedure")
        codes = {e["code"] for e in result["errors"]}
        self.assertIn("procedures_missing", codes)
        self.assertIn("drugs_missing", codes)

    def test_cli_labels_exam_only_pass(self):
        self.save()
        result = subprocess.run(
            [sys.executable, str(ROOT / "scripts/verify_procedure_note.py"), "--exam-only",
             "--note", str(self.note_path), "--manifest", str(self.manifest_path)],
            capture_output=True, text=True, check=False)
        self.assertEqual(result.returncode, 0, result.stderr + result.stdout)
        self.assertEqual(json.loads(result.stdout)["scope"], "exam_only")


if __name__ == "__main__":
    unittest.main()
