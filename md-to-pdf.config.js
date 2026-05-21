// =============================================================================
// md-to-pdf configuration for the gp-pdf skill
// Renders any Markdown file into a Gigantic Playground branded PDF.
// =============================================================================

// -----------------------------------------------------------------------------
// Tunables — adjust these to change how every PDF looks/behaves.
// -----------------------------------------------------------------------------

// Toggle CLICKABLE_HEADER_URL to control whether the giganticplayground.com URL
// in the top-right header becomes a clickable link in the rendered PDF.
//   true  → injects a JS-built HTML header in place of the CSS pseudo-element
//           header, so the URL is a real <a> tag (clickable in the PDF).
//   false → leaves the CSS-rendered header alone; URL is plain text.
// The visual layout is identical either way.
const CLICKABLE_HEADER_URL = true;

// FOOTER_COPYRIGHT is the left-hand text in the page footer of every page.
const FOOTER_COPYRIGHT =
  "© 2026 Gigantic Playground. Confidential & Proprietary.";

// -----------------------------------------------------------------------------
// Internals — typically no need to touch below this line.
// -----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");

const SKILL_DIR = __dirname;
const LOGO_PATH = path.join(SKILL_DIR, "gp-logo.png");
const FONT_PATH = path.join(SKILL_DIR, "inter-latin-regular.woff2");
const CSS_PATH = path.join(SKILL_DIR, "gp-markdown-preview.css");

// Read the CSS template and rewrite every relative asset URL to an absolute
// file:// URI. md-to-pdf inlines the CSS into a temp-rendered page, so the
// relative URLs in the source CSS wouldn't otherwise resolve to anything.
const cssTemplate = fs.readFileSync(CSS_PATH, "utf8");
const css = cssTemplate.replace(
  /url\("([^"]+\.(?:png|woff2))"\)/g,
  (_, filename) => `url("file://${path.join(SKILL_DIR, filename)}")`
);

// Read the logo and font as base64 for places that *can't* use file:// URLs:
//   - The JS-injected header below needs the logo inline since it's built
//     by client-side script that may run after the file context is gone.
//   - Puppeteer's footer template renders in an isolated document context
//     and can't load external resources, so the font goes inline there too.
const LOGO_DATA_URI = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;
const FOOTER_FONT_DATA_URI = `data:font/woff2;base64,${fs.readFileSync(FONT_PATH).toString("base64")}`;

const FOOTER_TEMPLATE = `
  <style>
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      src: url(${FOOTER_FONT_DATA_URI}) format('woff2');
    }
  </style>
  <div style="font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9px; color: #888; width: 100%; padding: 0 0.75in; display: flex; justify-content: space-between;">
    <span>${FOOTER_COPYRIGHT.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
    <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div>
`;

const headerScript = `
(function () {
  function init() {
    // Hide the original CSS-rendered header pseudo-element.
    const reset = document.createElement('style');
    reset.textContent = 'body::before { content: none !important; }';
    document.head.appendChild(reset);

    // Inject an HTML header with the same visual layout but a real <a> tag,
    // so the URL ends up as a clickable link in the PDF.
    const header = document.createElement('div');
    header.style.cssText = [
      'display: flex',
      'align-items: center',
      'justify-content: space-between',
      'min-height: 52px',
      'margin-bottom: 20px',
      'gap: 24px',
    ].join(';');
    header.innerHTML = [
      '<div style="flex-shrink:0;width:160px;height:52px;background-image:url(' + "'" + ${JSON.stringify(LOGO_DATA_URI)} + "'" + ');background-size:160px auto;background-repeat:no-repeat;background-position:left center;"></div>',
      '<div style="text-align:right;color:#1d1c1d;font-size:13.5px;line-height:1.5;">',
        '<a href="https://giganticplayground.com" style="color:#1d1c1d;text-decoration:none;">giganticplayground.com</a><br>',
        'Experience Design + Creative Technology',
      '</div>',
    ].join('');
    document.body.insertBefore(header, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

module.exports = {
  css: css,
  pdf_options: {
    format: "Letter",
    margin: {
      top: "0.5in",
      bottom: "0.65in",
      left: "0.5in",
      right: "0.5in",
    },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: FOOTER_TEMPLATE,
  },
  launch_options: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  ...(CLICKABLE_HEADER_URL ? { script: [{ content: headerScript }] } : {}),
};
