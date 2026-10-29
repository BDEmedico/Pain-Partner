#!/usr/bin/env bash
# Reusable release checks: stop on the first failure. No patient data.
set -euo pipefail
cd "$(dirname "$0")/.."
python -m unittest discover -s scripts -p 'test*procedure*.py' -v
node scripts/test_root_sequence.cjs
node scripts/test_procedure_defaults.cjs
python scripts/build_plugin_bundle.py
git diff --check
