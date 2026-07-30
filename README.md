# TurdGobbler's Deck Name Colourifier

A fan-made, browser-based utility for creating colourful Magic Arena deck names while respecting Arena's 64-character encoded-name limit.

## Site structure

- `/` is the landing page.
- `/colour/` is the standard Version 6 Deck Name Colourifier.
- `/ultimate/` is the full-featured Ultimate Version, sourced from the internal `version7` development line.
- `/cheugs/` is an intentionally unlisted joke edition whose escape link returns to `/colour/`.

The `/colour/` and `/ultimate/` folders provide the two public editions. No backend or server-side code is required.

## Privacy and safety

Everything runs locally in the visitor's browser. The site makes no network requests after its own files have loaded, contains no advertising or analytics, and does not transmit deck names or colour choices. Recent colours and preferences may be stored locally by the visitor's browser.

The project uses ordinary HTML, CSS and JavaScript with no external packages or services.

## Publishing with GitHub Pages

Upload the contents of this folder to the root of the GitHub Pages repository, preserving the `colour`, `ultimate`, and `cheugs` folders. The repository root must contain `index.html`, `site.css`, and `.nojekyll`.

TurdGobbler's Deck Name Colourifier is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. © Wizards of the Coast LLC.
