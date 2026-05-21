# gp-pdf-skill

A [Claude Code](https://docs.claude.com/en/docs/claude-code) skill that renders any Markdown file into a **Gigantic Playground branded PDF**.

Header: GP logo + `giganticplayground.com` + tagline.
Footer: copyright + page numbers.
Typography: Inter (body) + Poppins (headings).
Fully offline once installed — no network calls at build time.

## What's in this repo

| File | Purpose |
|------|---------|
| `SKILL.md` | Claude Code skill manifest (frontmatter + docs). |
| `build-pdf.sh` | Generic build script: `./build-pdf.sh <input.md> [output.pdf]`. |
| `md-to-pdf.config.js` | Configures md-to-pdf (header injection, footer template, embedded font). |
| `gp-markdown-preview.css` | Document styling. Also usable for VS Code Markdown preview via the GitHub Pages URL. |
| `gp-logo.png` | GP wordmark. |
| `inter-latin-regular.woff2` | Inter Regular 400, Latin subset (body text). |
| `poppins-latin-600.woff2` | Poppins SemiBold 600 (H3+, strong, table heads). |
| `poppins-latin-700.woff2` | Poppins Bold 700 (H2). |
| `poppins-latin-800.woff2` | Poppins ExtraBold 800 (H1). |

## Install on a new machine

The skill folder lives in your "Code projects" location and is symlinked into Claude's skills directory so the `/gp-pdf` slash command resolves.

```bash
# 1. Clone the repo to a normal projects location
mkdir -p ~/Desktop/gp-clients/gp
cd ~/Desktop/gp-clients/gp
git clone git@github.com:giganticplayground/gp-pdf-skill.git

# 2. Symlink it into Claude's skills directory
mkdir -p ~/.claude/skills
ln -s ~/Desktop/gp-clients/gp/gp-pdf-skill ~/.claude/skills/gp-pdf

# 3. Verify the slash command resolves
ls -la ~/.claude/skills/gp-pdf/SKILL.md   # should print the file via the symlink
```

## Use it

### From Claude Code

Type `/gp-pdf` and Claude will render the markdown file in your working directory.

### From the shell

```bash
~/.claude/skills/gp-pdf/build-pdf.sh path/to/document.md
# Writes path/to/document.pdf alongside the input.

~/.claude/skills/gp-pdf/build-pdf.sh path/to/document.md path/to/custom-name.pdf
# Writes to the specified output path.
```

## Use the styling in VS Code's Markdown preview

This repo is served via GitHub Pages, so you can point VS Code's `markdown.styles` setting at the hosted CSS and get the same GP look in the live preview:

```jsonc
// ~/Library/Application Support/Code/User/settings.json (macOS)
{
  "markdown.styles": [
    "https://giganticplayground.github.io/gp-pdf-skill/gp-markdown-preview.css"
  ]
}
```

The CSS references the logo and font files via relative URLs (`url("gp-logo.png")`, `url("inter-latin-regular.woff2")`, etc.) which resolve to the matching Pages URLs because everything is served from the same directory.

If the preview ever caches a stale version, append `?v=N` to the URL to bust the cache:

```jsonc
"markdown.styles": [
  "https://giganticplayground.github.io/gp-pdf-skill/gp-markdown-preview.css?v=2"
]
```

## Tunables (top of `md-to-pdf.config.js`)

- **`CLICKABLE_HEADER_URL`** (boolean, default `true`) — when `true`, the URL in the top-right header is rendered as a real `<a>` tag (clickable in the PDF). When `false`, it's plain text via the CSS pseudo-element.
- **`FOOTER_COPYRIGHT`** (string) — the left-hand text in the page footer.

## Updating brand assets

1. Edit the file in your local clone (or via the symlink — both point at the same place).
2. `git add . && git commit -m "..." && git push`
3. VS Code preview picks up the change within ~1 minute (GitHub Pages CDN cache). PDF builds pick it up immediately.

To add a new font weight or family: drop the new `.woff2` into this directory and add a matching `@font-face` block in `gp-markdown-preview.css`. The `md-to-pdf.config.js` URL rewriter automatically handles any `url("*.woff2")` reference at build time.

## Requirements

- **Node.js** (the build script calls `npx md-to-pdf`).
- **Chromium / Chrome** (Puppeteer typically downloads its own).
- No global package installs required; `npx --yes` fetches `md-to-pdf` on first run.

## License

Internal Gigantic Playground tooling. Brand assets (logo, name) are property of Gigantic Playground. Inter and Poppins are licensed under the SIL Open Font License.
