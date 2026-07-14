# TurdGobbler's Deck Name Colourifier

A fan-made, browser-based utility for creating colourful Magic Arena deck names while respecting Arena's 64-character encoded-name limit.

## Site structure

- `/` is the landing page.
- `/colour/` is Version 3 and the primary Deck Name Colourifier.
- `/arcane/` and `/metal/` preserve the previous editions.

The `/colour/` folder is what makes `https://turdgobbler.com/colour/` work. No backend or server-side code is required.

## Privacy and safety

Everything runs locally in the visitor's browser. The site makes no network requests after its own files have loaded, contains no advertising or analytics, and does not transmit deck names or colour choices. Recent colours and preferences may be stored locally by the visitor's browser.

The project uses ordinary HTML, CSS and JavaScript with no external packages or services.

## Publishing with GitHub Pages

Upload the contents of this folder to the root of the GitHub Pages repository, preserving the `colour`, `arcane`, and `metal` folders. The repository root must contain `index.html`, `site.css`, and `.nojekyll`.

This is an unofficial fan-made utility and is not affiliated with Wizards of the Coast.
