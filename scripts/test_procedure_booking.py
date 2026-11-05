"""Synthetic regressions for losing a branch in an unscheduled booking request."""
from pathlib import Path
import unittest

from verify_booking_output import canonical_branches, verify_booking


ROOT = Path(__file__).resolve().parents[1]


class BookingBranchRetention(unittest.TestCase):
    def setUp(self):
        self.preferences = (ROOT / 'WORKFLOW-PREFERENCES.md').read_text()
        self.tuesday, self.wednesday = canonical_branches(self.preferences)
        # The check is medication-agnostic; this invented name asserts no dosing policy.
        self.header = 'Anticoagulation: Yes — synthetic medication. Hold before the procedure.\n\n'
        self.note = self.header + self.tuesday + '\n\n' + self.wednesday + '\n'

    def check(self, note):
        return verify_booking(note, self.preferences)

    def test_complete_instruction_passes(self):
        self.assertEqual(self.check(self.note)['status'], 'PASS')

    def test_tuesday_only_reproduces_reported_failure(self):
        result = self.check(self.header + 'For example, ' + self.tuesday)
        self.assertEqual(result['status'], 'NEEDS_REPAIR')
        self.assertTrue(any('Wednesday' in error for error in result['errors']))

    def test_wednesday_only_fails(self):
        self.assertEqual(self.check(self.header + self.wednesday)['status'], 'NEEDS_REPAIR')

    def test_last_dose_omission_and_restart_mutations_fail(self):
        for old, new in [('on Saturday', 'on Sunday'),
                         ('none on Monday', 'none on Tuesday'),
                         ('Restart on Thursday', 'Restart on Friday'),
                         (' if all feels well', '')]:
            with self.subTest(old=old):
                self.assertEqual(self.check(self.note.replace(old, new))['status'], 'NEEDS_REPAIR')

    def test_duplicate_branch_fails(self):
        self.assertEqual(self.check(self.note + self.wednesday)['status'], 'NEEDS_REPAIR')

    def test_wrapping_and_bullets_are_allowed(self):
        wrapped = self.header + '- ' + self.tuesday.replace('. Restart', '.\n  Restart') + '\n- ' + self.wednesday
        self.assertEqual(self.check(wrapped)['status'], 'PASS')

    def test_historical_branch_does_not_fill_missing_booking_branch(self):
        note = 'Historical instruction:\n' + self.wednesday + '\n\n' + self.header + self.tuesday
        self.assertEqual(self.check(note)['status'], 'NEEDS_REPAIR')

    def test_antiplatelet_field_does_not_fill_missing_anticoagulant_branch(self):
        note = self.header + self.tuesday + '\nAntiplatelets (excluding ASA):\n' + self.wednesday
        self.assertEqual(self.check(note)['status'], 'NEEDS_REPAIR')

    def test_incomplete_canonical_source_fails_closed(self):
        changed = self.preferences.replace(self.wednesday, '')
        self.assertEqual(verify_booking(self.note, changed)['status'], 'NEEDS_REPAIR')


if __name__ == '__main__':
    unittest.main()
