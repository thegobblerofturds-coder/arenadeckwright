# TurdGobbler's Beaver Dam

The Beaver Dam stream homepage and its colour workshop. The browser-based tools create colourful Magic Arena deck names while respecting Arena's 64-character encoded-name limit.

## Site structure

- `/` is the Beaver Dam lodge homepage.
- `/colour/` is the standard Version 6 Deck Name Colourifier, with its original prismatic appearance.
- `/ultimate/` is the full-featured Ultimate Version, sourced from the internal `version7` development line.
- `/mega/` is the complete workshop with profiles, diagnostics and portable backups, discoverable through the quiet footer directory rather than the homepage cards.
- `/tools/` is the complete directory, linked only from a small homepage footer link and marked noindex/nofollow.
- `/metal/` and `/goblin/` are alternate deck-name workshops.
- `/thou/` is the Thousandths Trainer; `/thou/certificate/` is its companion certificate page.
- `/cheugs/` is a tucked-away joke edition whose escape link returns to `/colour/`.
- `/tim/` is a no-index technical digest in the quiet directory of SpatialAnalyzer point-cloud and colourization improvements.
- `/relax/` is Bubble Mix: a rainbow bubble playground with viscous stretching, merging, pop points, combos, and celebrations.

The `/colour/`, `/ultimate/` and `/mega/` folders retain their original engines. Ultimate and MEGA use the lodge presentation in `beaver-dam-tools.css`; Colourifier retains its original `styles.css` with only a navigation link styled in `colour/home-link.css`; shared artwork and navigation icons live in `assets/beaver-dam/`. No backend or server-side code is required.

## Privacy and safety

Everything runs locally in the visitor's browser. The site makes no network requests after its own files have loaded, contains no advertising or analytics, and does not transmit deck names or colour choices. Recent colours and preferences may be stored locally by the visitor's browser.

The project uses ordinary HTML, CSS and JavaScript with no external packages or services.

## Publishing with GitHub Pages

GitHub Pages publishes `main` from the repository root at `turdgobbler.com`. Preserve all existing route folders and `CNAME`. The lodge also uses `favicon.svg`, `beaver-dam-tools.css`, and `assets/beaver-dam/`.

The September 2026 rebrand was checked at 1440px and 390px, including deck-name editing, clipboard exports, all three tool routes, asset loading and unchanged engine code.

TurdGobbler's Deck Name Colourifier is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. © Wizards of the Coast LLC.
