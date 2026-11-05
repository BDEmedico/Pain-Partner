"""Embed approved booking text in the standalone HTML; no patient data."""
from pathlib import Path
import argparse
import hashlib
import json
import re
from verify_booking_output import canonical_branches

ROOT = Path(__file__).resolve().parents[1]


def build(check=False):
    preferences = (ROOT / 'WORKFLOW-PREFERENCES.md').read_text()
    # The canonical prose is maintained in preferences; do not hand-edit the HTML payload.
    match = re.search(r'Exact approved booking wording: `([^`]+)`', preferences)
    if not match or not match[1].startswith('Antiplatelets (excluding ASA): Yes — clopidogrel.'):
        raise ValueError('Expected the approved clopidogrel booking instruction.')
    phenol = re.search(r'<!-- approved-phenol-booking:start -->(.*?)<!-- approved-phenol-booking:end -->', preferences, re.S)
    if not phenol:
        raise ValueError('Expected canonical phenol booking logistics.')
    phenol_paragraphs = [p.strip() for p in phenol[1].strip().split('\n\n') if p.strip()]
    if len(phenol_paragraphs) != 2:
        raise ValueError('Expected two phenol booking paragraphs.')
    data = {'acBranches': canonical_branches(preferences), 'clopidogrel': match[1], 'phenol': phenol_paragraphs,
            'source_sha256': hashlib.sha256(preferences.encode()).hexdigest()}
    payload = json.dumps(data, ensure_ascii=False, indent=2).replace('<', '\\u003c')
    path = ROOT / 'booking-builder.html'
    old = path.read_text()
    updated, count = re.subn(r'(<script id="booking-templates" type="application/json">)[\s\S]*?(</script>)',
                             lambda m: m[1] + payload + m[2], old)
    if count != 1:
        raise ValueError('Expected one generated booking template payload.')
    engine = (ROOT / 'scripts' / 'booking_engine.cjs').read_text()
    updated, engine_count = re.subn(r'(<script id="booking-engine">)[\s\S]*?(</script>)',
                                  lambda m: m[1] + '\n' + engine + '\n' + m[2], updated)
    if engine_count != 1:
        raise ValueError('Expected one generated booking engine.')
    if check:
        if old != updated:
            raise ValueError('Booking engine/templates are stale; run scripts/build_booking_builder.py.')
        print('PASS: standalone booking engine and templates match their sources.')
    else:
        path.write_text(updated)
        print('Embedded booking engine and approved templates in booking-builder.html.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
