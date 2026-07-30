TURDGOBBLER'S DECK NAME COLOURIFIER — ULTIMATE VERSION

STATUS
This folder is the local Ultimate development source. Version 6 remains the
standard /colour/ release and Version Lite remains shelved. The public
/ultimate/ route is updated only during an explicit release.

QUICK START
1. Keep every file in this folder together.
2. Open index.html in a modern browser.
3. Type a deck name.
4. Add colours and effects by clicking a source at the active caret or dragging
   a source into the Mega Tube.
5. Click the Arena Mirror to copy, then paste into Magic: The Gathering Arena.

THE ONE-TUBE MODEL
- The Mega Tube is the only positioned editor.
- Colour bubbles live on the colour lane.
- Positioned effects and sprites live on the FX lane.
- Global effects appear as chips above both lanes.
- Every colour bubble, including bubble 1 and a single remaining bubble, is
  freely movable by pointer and keyboard.
- Click the tube to move the active caret. A source click inserts there.
- Dragging has a click alternative. Positioned bubbles also support Arrow keys,
  Shift+Arrow, Page Up/Down, Home, End, Delete, and Backspace.
- Selecting any tube layer opens one nearby inspector for editing, duplication,
  and deletion.
- Undo and Redo cover direct manipulation, source insertion, presets, and reset.

THE THREE PRESET SYSTEMS
1. WUBRG ENGINE searches and applies Magic colour identities.
2. COLOUR PRESETS applies curated colour recipes.
3. STYLE PRESETS applies reusable global effect recipes.

WUBRG and Colour Presets replace only the colour layer. Style Presets replace
only global style. Positioned effects and sprites remain intact, so the three
systems can be layered without surprising cross-category resets.

COLOUR + EFFECT SOURCES
- Custom hex input, a native colour picker, and fast colour swatches.
- Global or positioned italic, underline, strike, sup, sub, size, character
  spacing, rotation, vertical offset, and horizontal position.
- Global ALL CAPS costs zero tag characters.
- Positioned line break, mono spacing, spacing, highlight, and alpha effects.
- Arena sprites 0 through 15 are kept in a submenu inside Effects.

ULTIMATE COMPILER
- Arena's raw deck-name limit is 64 characters.
- The budget is exact: TEXT + COLOUR + FX = TOTAL / 64.
- Explicit FX remain intact; colour stages reduce first when necessary.
- A moved first visual colour still supplies Arena's required start-of-name
  colour without forcing its bubble back to zero.
- Inline events preserve caret position and literal sequence.
- Raw Arena code remains visible in the Advanced drawer.

PREVIEW + PRIVACY
- The Arena Mirror uses a fully opaque black background in every interaction
  state.
- The preview uses the local Beleren font and extracted sprite crops.
- Browser geometry is an approximation of Unity/TextMesh Pro; the raw compiler
  and character accounting are authoritative.
- Work is stored only in browser local storage. Nothing is uploaded.
- The app has no account, analytics, tracking, or network requirement.

FILES
- index.html: the focused one-tube interface.
- app.js: editor state, layer interactions, presets, preview, persistence,
  history, and copy behavior.
- logic.js: pure compiler, serialization, normalization, and budget accounting.
- styles.css: responsive Ultimate visual system.
- ULTIMATE_AUDIT.md: the removal, retention, research, and architecture record.
- assets/: Arena review font and sprite assets with provenance notes.
- ARENA_FIT_TESTS.md: manual Arena calibration checklist.
