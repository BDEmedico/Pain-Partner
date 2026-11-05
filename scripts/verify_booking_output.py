"""Check retention of a clinician-selected two-day booking instruction.

Use only when that schedule has already been selected and the booking day is
unknown. This is a wording check, not a drug/interval recommendation. Clinical
applicability and any unresolved safety conflict must be reviewed separately.
The approved wording lives in WORKFLOW-PREFERENCES.md, not in this checker.
"""
import argparse
import json
from pathlib import Path
import re


START = '<!-- approved-two-day-anticoagulant:start -->'
END = '<!-- approved-two-day-anticoagulant:end -->'


def canonical_branches(preferences):
    if preferences.count(START) != 1 or preferences.count(END) != 1:
        raise ValueError('Expected one canonical two-day instruction in preferences.')
    block = preferences.split(START, 1)[1].split(END, 1)[0]
    branches = [line.strip() for line in block.splitlines()
                if line.strip().startswith('If procedure on ')]
    if (len(branches) != 2 or
            not branches[0].startswith('If procedure on Tuesday,') or
            not branches[1].startswith('If procedure on Wednesday,')):
        raise ValueError('Canonical instruction must retain Tuesday and Wednesday branches.')
    return branches


def verify_booking(note, preferences):
    errors = []
    try:
        branches = canonical_branches(preferences)
    except ValueError as exc:
        errors.append(str(exc))
        branches = []
    # Do not allow a branch in the history to satisfy an incomplete booking field.
    fields = re.split(r'(?m)^Anticoagulation:\s*', note)
    if len(fields) != 2:
        errors.append('Expected exactly one Anticoagulation booking field.')
    else:
        field = re.split(r'(?m)^[A-Za-z][A-Za-z /()—-]*:', fields[1], maxsplit=1)[0]
        normalized = ' '.join(field.split())
        for branch in branches:
            if normalized.count(' '.join(branch.split())) != 1:
                day = branch.split(',')[0].removeprefix('If procedure on ')
                errors.append(f'Missing, changed or duplicated {day} branch; retain its complete instruction.')
        if '[documented medication]' in field:
            errors.append('Replace the medication placeholder with the documented drug.')
    return {
        'status': 'NEEDS_REPAIR' if errors else 'PASS',
        'scope': 'selected_two_day_booking_wording',
        'errors': errors,
        'limitation': 'Checks both selected branches in the booking field only; does not validate the drug, dose, hold interval, restart interval or clinical appropriateness.',
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--note', required=True, type=Path)
    parser.add_argument('--preferences', required=True, type=Path)
    args = parser.parse_args()
    try:
        result = verify_booking(args.note.read_text(), args.preferences.read_text())
    except (OSError, UnicodeError) as exc:
        parser.exit(1, f'Unable to read review inputs: {exc}\n')
    print(json.dumps(result, indent=2))
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
