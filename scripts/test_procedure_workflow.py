"""Synthetic end-to-end workflow checks using the actual example, preferences and HTML."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from verify_procedure_note import verify, REVIEW_NAMES

ROOT = Path(__file__).resolve().parents[1]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


class WorkflowIntegration(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.note_path = Path(self.tmp.name) / 'draft.txt'
        self.manifest_path = Path(self.tmp.name) / 'review.json'
        example = (ROOT / 'skills/clinic-visit/references/procedure-example.md').read_text()
        self.note = example.split('```text\n', 1)[1].split('\n```', 1)[0] + '\n'
        self.note_path.write_text(self.note)
        self.sources = {
            'prior': ROOT / 'tests/fixtures/procedure-review/prior.txt',
            'dictation': ROOT / 'tests/fixtures/procedure-review/update.txt',
            'html': ROOT / 'procedure-note-builder.html',
            'preferences': ROOT / 'WORKFLOW-PREFERENCES.md',
        }
        self.texts = {k: p.read_text() for k, p in self.sources.items()}
        roles = {'prior': 'previous_note', 'dictation': 'dictation', 'html': 'template', 'preferences': 'preferences'}
        anchors = {'prior': ['A 66-year-old woman'], 'dictation': ['No new examination.'],
                   'html': ['lumbar_root_sequence: {', 'function screenBlock()', 'function consentParagraph()', 'function tailBlock()'],
                   'preferences': ['Full chart continuity', 'Procedure output format']}
        receipts = [{'id': k, 'path': str(p), 'role': roles[k], 'sha256': sha(p.read_bytes()),
                     'read': True, 'anchors': anchors[k]} for k, p in self.sources.items()]
        carry = []
        for quote in ['Hypertension.', 'Appendectomy.', 'Amlodipine 5 mg daily.',
                      'NKDA. No contrast allergy.', 'Lives with her spouse. Retired. No tobacco use.',
                      'Gabapentin — dizziness.', 'Physiotherapy and home exercises.',
                      'Left anterior thigh pain worsens with prolonged standing. Home exercises help her back pain.',
                      'Motor: L2–S1 5/5 bilaterally.', 'Sensation: L2–S1 intact to light touch bilaterally.',
                      'Reflexes: Patellar and Achilles 2+ bilaterally.',
                      'Possible left L4 radicular pain.']:
            carry.append({'source_id': 'prior', 'quote': quote, 'note_quote': quote})
        carry.extend([
            {'source_id': 'prior', 'quote': 'A 66-year-old woman', 'note_quote': '66-year-old female'},
            {'source_id': 'prior', 'quote': 'Lumbar MRI: left L4–5 foraminal narrowing.', 'note_quote': 'Lumbar MRI: Left L4–5 foraminal narrowing.'},
            {'source_id': 'prior', 'quote': 'PREVIOUS PAIN PROCEDURES\nNone.', 'note_quote': 'None before today.'},
        ])
        evidence = lambda source, quote, note: {'source_id': source, 'quote': quote, 'note_quote': note}
        d_ev = evidence('dictation', 'One cc bupivacaine 0.5% at the root', '1 cc bupivacaine 0.5%')
        self.manifest = {
            'version': 1, 'note_sha256': sha(self.note.encode()), 'sources': receipts,
            'required_sections': ['MEDICAL HISTORY', 'SURGICAL HISTORY', 'CURRENT MEDICATIONS', 'ALLERGIES',
                                  'SOCIAL HISTORY', 'PREVIOUS PAIN MEDICATIONS', 'PREVIOUS / CURRENT NON-PHARM',
                                  'INVESTIGATIONS', 'PREVIOUS PAIN PROCEDURES', 'PAIN HISTORY', 'INTERIM HISTORY',
                                  'Previous EXAM', 'IMPRESSION', 'PLAN'],
            'carry_forward': carry,
            'procedures': [{'id': 'root', 'template_source': 'html', 'template_entry': 'lumbar_root_sequence',
                            'shared_logic_anchors': anchors['html'][1:], 'side': 'LEFT', 'levels': ['L4', 'L4–5'],
                            'note_anchor': 'Procedure note:',
                            'expected_text': ['left L4 pedicle', 'left L4–5 foramen', 'No corticosteroid was administered.', 'without epidural, vascular or intrathecal spread'],
                            'evidence': [evidence('dictation', 'Left L4 root accessed through L4–5.', 'left L4–5 foramen')]}],
            'drugs': [
                {'id': 'bupivacaine', 'components': [{'volume_ml': 1, 'concentration_percent': 0.5}],
                 'final_volume_ml': 1, 'total_mg': 5, 'final_concentration_percent': 0.5,
                 'note_anchor': '- Left L4 root:', 'expected_text': ['1 cc bupivacaine 0.5%'], 'evidence': [d_ev]},
                {'id': 'skin_lidocaine', 'components': [{'volume_ml': 2, 'concentration_percent': 1}],
                 'final_volume_ml': 2, 'total_mg': 20, 'final_concentration_percent': 1,
                 'note_anchor': '- Skin local anesthetic:', 'expected_text': ['2 cc lidocaine 1%'],
                 'evidence': [evidence('dictation', 'skin local 2 cc lidocaine 1%', '2 cc lidocaine 1%')]}],
            'expected_text': ['66-year-old female', 'Contrast: 1 cc.', 'Telephone follow-up in two weeks'],
            'forbidden_text': ['strength preserved'],
            'reviews': {
                'source_completeness': {'status': 'complete', 'note_sha256': sha(self.note.encode()), 'evidence': carry},
                'exam_fidelity': {'status': 'complete', 'note_sha256': sha(self.note.encode()), 'evidence': [
                    evidence('dictation', 'No new examination.', 'Previous EXAM'), *carry[8:11]]},
                'dictated_exceptions': {'status': 'complete', 'note_sha256': sha(self.note.encode()), 'evidence': [
                    evidence('dictation', 'No steroid.', 'No corticosteroid was administered.')]},
                'clinical_consistency': {'status': 'complete', 'note_sha256': sha(self.note.encode()), 'evidence': [
                    evidence('dictation', 'phone follow-up in two weeks', 'Telephone follow-up in two weeks'), d_ev]},
            },
        }

    def run_verifier(self):
        self.manifest_path.write_text(json.dumps(self.manifest))
        return verify(self.note_path, self.manifest_path)

    def test_actual_html_and_complete_example(self):
        result = self.run_verifier()
        self.assertEqual(result['status'], 'PASS', result)

    def test_abbreviating_chart_breaks_pass(self):
        self.note_path.write_text(self.note.replace('MEDICAL HISTORY: Hypertension.\n\n', ''))
        self.assertNotEqual(self.run_verifier()['status'], 'PASS')

    def test_wrong_age_fails_even_after_review_hash_refresh(self):
        changed = self.note.replace('66-year-old', '72-year-old')
        self.note_path.write_text(changed)
        self.manifest['note_sha256'] = sha(changed.encode())
        for review in self.manifest['reviews'].values():
            review['note_sha256'] = sha(changed.encode())
        result = self.run_verifier()
        self.assertNotEqual(result['status'], 'PASS')
        self.assertTrue(any(e['code'] == 'evidence_note' for e in result['errors']))

    def test_unsupported_impression_rewrite_fails_after_hash_refresh(self):
        prior_impression = self.texts['prior'].split('IMPRESSION\n', 1)[1].split('\nPLAN', 1)[0].strip()
        current_impression = self.note.split('IMPRESSION\n', 1)[1].split('\n\nProcedure performed:', 1)[0].strip()
        self.assertEqual(current_impression, prior_impression)
        changed = self.note.replace(prior_impression, 'Left thigh pain may be radicular in origin.')
        self.note_path.write_text(changed)
        self.manifest['note_sha256'] = sha(changed.encode())
        for review in self.manifest['reviews'].values():
            review['note_sha256'] = sha(changed.encode())
        result = self.run_verifier()
        self.assertNotEqual(result['status'], 'PASS')
        self.assertTrue(any(e['code'] == 'evidence_note' for e in result['errors']))

    def test_repository_policy_no_old_conflicting_macros(self):
        prefs = self.texts['preferences']
        self.assertNotIn('Place the heading "PROCEDURE NOTE" immediately', prefs)
        self.assertNotIn('Booking duration: 30 minutes', prefs)
        for name in ['workflow.md', 'follow-up-workflow.md']:
            reference = (ROOT / 'skills/clinic-visit/references' / name).read_text()
            self.assertNotIn('last dose Saturday', reference)
            self.assertNotIn('Stop point (standing rule)', reference)
        macro = (ROOT / 'skills/clinic-visit/references/physical-exam.md').read_text()
        self.assertIn('- Sensation: L2–S1 intact to light touch bilaterally.', macro)


if __name__ == '__main__':
    unittest.main()
