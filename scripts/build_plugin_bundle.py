"""Build a portable source bundle; does not publish or assume a plugin import API."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'dist' / 'pain-partner-update.zip'


def build():
    files = {}
    for path in sorted((ROOT / 'skills').rglob('*')):
        if path.is_file():
            files[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    preferences = (ROOT / 'WORKFLOW-PREFERENCES.md').read_bytes()
    for name in ('clinic-visit', 'referral-letter'):
        files[f'skills/{name}/references/preferences.md'] = preferences
    files['skills/clinic-visit/assets/procedure-note-builder.html'] = (ROOT / 'procedure-note-builder.html').read_bytes()
    files['PUBLICATION.md'] = (ROOT / 'PUBLICATION.md').read_bytes()
    checksums = {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}
    files['SHA256.json'] = (json.dumps(checksums, indent=2) + '\n').encode()
    DEST.parent.mkdir(exist_ok=True)
    with ZipFile(DEST, 'w', ZIP_DEFLATED) as archive:
        for name, data in files.items():
            archive.writestr(name, data)
    with ZipFile(DEST) as archive:
        assert archive.testzip() is None
        for name, digest in checksums.items():
            assert hashlib.sha256(archive.read(name)).hexdigest() == digest
        assert archive.read('skills/clinic-visit/assets/procedure-note-builder.html') == (ROOT / 'procedure-note-builder.html').read_bytes()
        assert not any('follow-up-visit/' in name for name in archive.namelist())
    print(f'Built and verified {DEST} ({len(files)} files)')


if __name__ == '__main__':
    build()
