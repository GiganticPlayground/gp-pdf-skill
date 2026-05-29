#!/usr/bin/env bash
set -euo pipefail

# gp-pdf — render a Markdown or plain-text file into a Gigantic Playground branded PDF.
#
# Accepts .md, .markdown, and .txt input (.txt is rendered as Markdown).
#
# Usage:
#   gp-pdf <input.md|.markdown|.txt>          → writes <input>.pdf next to the input file
#   gp-pdf <input.md|.markdown|.txt> <out.pdf> → writes to a specific output path

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $(basename "$0") <input.md|.markdown|.txt> [output.pdf]" >&2
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

# md-to-pdf has no output-path flag: it always writes a sibling file with the
# source extension replaced by .pdf (works for .md, .markdown, and .txt alike).
DEFAULT_PDF="${INPUT_MD%.*}.pdf"

echo "Generating PDF: $INPUT_MD → ${2:-$DEFAULT_PDF}"
npx --yes md-to-pdf "$INPUT_MD" --config-file "$CONFIG"

# When a custom output path was requested, move md-to-pdf's sibling output there.
if [[ $# -eq 2 && "$2" != "$DEFAULT_PDF" ]]; then
  mv -f "$DEFAULT_PDF" "$2"
fi

echo "Done."
