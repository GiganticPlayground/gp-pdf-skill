---
name: gp-pdf
description: Render any Markdown or plain-text file into a Gigantic Playground branded PDF (GP logo + URL header, page numbers + copyright footer, Inter/Poppins typography, Letter size). Accepts .md, .markdown, and .txt input. Use whenever the user asks to produce a GP-branded PDF from a .md or .txt file, e.g. an SOW, internal doc, or proposal. Also use when the user asks to update or rebuild an existing GP PDF after edits to its source.
---

# gp-pdf — Gigantic Playground branded PDF from Markdown

This skill turns a Markdown (`.md`, `.markdown`) or plain-text (`.txt`) file into a PDF styled to match GP's document template. Plain-text files are rendered as Markdown, so any Markdown syntax they contain is still formatted.

The output:

- **Header (top of every page):** GP logo on the left, `giganticplayground.com` and "Experience Design + Creative Technology" tagline on the right. The URL is a clickable link in the rendered PDF.
- **Footer (bottom of every page):** "© 2026 Gigantic Playground. Confidential & Proprietary." on the left, "Page X of Y" on the right.
- **Typography:** Inter for body, Poppins for headings, Inter for the footer (font is embedded so it renders consistently on any machine).
- **Page size & margins:** US Letter, 0.5in side margins, 0.5in / 0.65in top/bottom.
- **Print-friendly:** headings stay with their content (no orphaned section titles), tables and images don't split across pages unless they're larger than a page.

## Files in this skill

| File | Purpose |
|------|---------|
| `gp-markdown-preview.css` | Document styling. Also usable for VS Code Markdown preview. |
| `gp-logo.png` | GP wordmark (320 × 104, ~8 KB) |
| `inter-latin-regular.woff2` | Inter Regular 400, Latin subset (body text) |
| `poppins-latin-600.woff2` | Poppins SemiBold 600, Latin subset (H3+, strong, table heads) |
| `poppins-latin-700.woff2` | Poppins Bold 700, Latin subset (H2) |
| `poppins-latin-800.woff2` | Poppins ExtraBold 800, Latin subset (H1) |
| `md-to-pdf.config.js` | Configures md-to-pdf with header injection, footer template, embedded font, etc. |
| `build-pdf.sh` | Generic build script. Takes any .md, .markdown, or .txt file and produces a sibling .pdf. |

## Usage

### From the shell

```bash
~/.claude/skills/gp-pdf/build-pdf.sh path/to/document.md
# Writes path/to/document.pdf alongside the input.
# Also accepts .markdown and .txt input (e.g. path/to/notes.txt → path/to/notes.pdf).

~/.claude/skills/gp-pdf/build-pdf.sh path/to/document.md path/to/custom-name.pdf
# Writes to the specified output path.
```

### As a Claude invocation

The user typically asks:
- "Make a PDF of this SOW"
- "Build / rebuild the PDF"
- "Regenerate the PDF"

Run the `build-pdf.sh` script in the skill directory, passing the user's `.md`, `.markdown`, or `.txt` file as the first argument.

If multiple source files exist in the working directory and the user hasn't named one explicitly, ask which file to render before running.

## Tunables (top of `md-to-pdf.config.js`)

- **`CLICKABLE_HEADER_URL`** (boolean, default `true`) — when true, replaces the CSS-rendered header pseudo-element with an HTML version so the URL is a real `<a>` tag (clickable in the PDF). When false, the URL renders as plain text.
- **`FOOTER_COPYRIGHT`** (string) — the left-hand text in the page footer.

## Requirements

- **Node.js** (the script invokes `npx md-to-pdf`).
- **Chromium / Chrome** installed somewhere md-to-pdf can find it (Puppeteer typically downloads its own).
- No global package installs required; `npx --yes` fetches `md-to-pdf` on first run.

## Notes

- The build script uses `npx --yes md-to-pdf`. First run on a fresh machine takes a minute or two while npm fetches md-to-pdf and Puppeteer; subsequent runs are quick (~3-5 seconds).
- All fonts and the logo are local files. No Google Fonts or other external resources are loaded at build time — the skill is fully offline-capable.
- The CSS uses relative URLs (`url("gp-logo.png")`, `url("inter-latin-regular.woff2")`, `url("poppins-latin-700.woff2")`, etc.) so the same file works in VS Code Markdown preview. At PDF-build time, the config reads each referenced asset from this skill directory and inlines its bytes as a `data:` URI directly into the CSS string handed to md-to-pdf. We do this (rather than rewriting URLs to absolute `file://` paths) because Puppeteer's Chromium silently refuses to load `@font-face` woff2 files from `file://` URLs across directories, falling back to system fonts without any error. Inlining the bytes guarantees the fonts actually load.
- The Inter font is also inlined as base64 inside the footer template because Puppeteer's footer document context is isolated and can't load external resources.

## Updating the brand assets

To swap the logo or any font: drop the new file into this skill directory with the same filename, no other changes needed.

To change the URL, tagline, footer copyright, or color palette: edit `gp-markdown-preview.css` (for the header) and `md-to-pdf.config.js` (for the `CLICKABLE_HEADER_URL` script and footer template).

To add more weights (e.g., Poppins Regular 400 or Italic): download the woff2 from Google Fonts (Latin subset), drop it into this skill directory, and add a matching `@font-face` block in `gp-markdown-preview.css`. The config will automatically inline the new file's bytes as a `data:` URI at build time — no further code changes needed.
