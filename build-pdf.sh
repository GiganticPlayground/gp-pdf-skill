#!/usr/bin/env bash
set -euo pipefail

# gp-pdf — render a Markdown file into a Gigantic Playground branded PDF.
#
# Usage:
#   gp-pdf <input.md>          → writes <input>.pdf next to the input file
#   gp-pdf <input.md> <out.pdf> → writes to a specific output path

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $(basename "$0") <input.md> [output.pdf]" >&2
  exit 1
fi

INPUT_MD="$1"

if [[ ! -f "$INPUT_MD" ]]; then
  echo "Error: file not found: $INPUT_MD" >&2
  exit 1
fi

# Resolve absolute path for the skill directory (where this script lives).
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SKILL_DIR/md-to-pdf.config.js"

if [[ $# -eq 2 ]]; then
  OUTPUT_PDF="$2"
  echo "Generating PDF: $INPUT_MD → $OUTPUT_PDF"
  npx --yes md-to-pdf "$INPUT_MD" --config-file "$CONFIG" --dest "$OUTPUT_PDF"
else
  echo "Generating PDF from: $INPUT_MD"
  npx --yes md-to-pdf "$INPUT_MD" --config-file "$CONFIG"
fi

echo "Done."
