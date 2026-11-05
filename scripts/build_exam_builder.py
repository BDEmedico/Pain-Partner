"""Embed the exam engine and policy receipts; the HTML owns editable review templates."""
from pathlib import Path
import argparse
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def build(check=False):
    path = ROOT / 'exam-builder.html'
    old = path.read_text()
    catalog = re.search(r'<script id="exam-catalog" type="application/json">(.*?)</script>', old, re.S)
    if not catalog:
        raise ValueError('Missing examination catalog.')
    data = json.loads(catalog[1])
    if data.get('version') != 1 or set(data['regions']) != {'lumbar', 'cervical', 'shoulder'}:
        raise ValueError('Invalid examination catalog.')
    for region in data['regions'].values():
        ids = [line['id'] for line in region['lines']]
        if len(set(ids)) != len(ids):
            raise ValueError('Duplicate examination row ID.')
    receipts = {
        'preferences_sha256': hashlib.sha256((ROOT / 'WORKFLOW-PREFERENCES.md').read_bytes()).hexdigest(),
        'physical_exam_sha256': hashlib.sha256((ROOT / 'skills/clinic-visit/references/physical-exam.md').read_bytes()).hexdigest(),
    }
    updated = old
    for marker, body in [('exam-source', json.dumps(receipts, indent=2)),
                         ('exam-engine', '\n' + (ROOT / 'scripts/exam_engine.cjs').read_text() + '\n')]:
        updated, count = re.subn(r'(<script id="' + marker + r'"[^>]*>).*?(</script>)',
                                lambda m: m[1] + body + m[2], updated, flags=re.S)
        if count != 1:
            raise ValueError('Expected exactly one ' + marker + ' script.')
    # Repository artifacts must not contain a live encounter prefill.
    prefill = re.search(r'<script id="exam-prefill" type="application/json">(.*?)</script>', updated, re.S)
    if not prefill or json.loads(prefill[1]) is not None:
        raise ValueError('Repository examination HTML must have a null prefill.')
    if check:
        if old != updated:
            raise ValueError('Examination HTML is stale; run scripts/build_exam_builder.py.')
        print('PASS: examination engine and policy receipts match their sources.')
    else:
        path.write_text(updated)
        print('Embedded examination engine and policy receipts in exam-builder.html.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(parser.parse_args().check)
