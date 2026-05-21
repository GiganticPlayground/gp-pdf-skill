#!/usr/bin/env bash
set -euo pipefail

# Package this skill into gp-pdf.zip for upload to claude.ai team/org skills.
#
# Produces the structure required by claude.ai:
#   gp-pdf.zip
#   └── gp-pdf/
#       ├── SKILL.md
#       └── ...supporting files
#
# Usage: ./package-skill.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="gp-pdf"
OUTPUT_ZIP="$SCRIPT_DIR/$SKILL_NAME.zip"

INCLUDE=(
  SKILL.md
  build-pdf.sh
  md-to-pdf.config.js
  gp-markdown-preview.css
  gp-logo.png
  inter-latin-regular.woff2
  inter-latin-600.woff2
  jetbrains-mono-latin-regular.woff2
  poppins-latin-600.woff2
  poppins-latin-700.woff2
  poppins-latin-800.woff2
)

for f in "${INCLUDE[@]}"; do
  if [[ ! -e "$SCRIPT_DIR/$f" ]]; then
    echo "Error: required file missing: $f" >&2
    exit 1
  fi
done

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

STAGE="$TMP_DIR/$SKILL_NAME"
mkdir -p "$STAGE"

for f in "${INCLUDE[@]}"; do
  cp "$SCRIPT_DIR/$f" "$STAGE/"
done

rm -f "$OUTPUT_ZIP"
(cd "$TMP_DIR" && zip -rq "$OUTPUT_ZIP" "$SKILL_NAME" -x "*.DS_Store")

echo "Created $OUTPUT_ZIP"
echo "Upload at: claude.ai → Skills → Upload skill"
