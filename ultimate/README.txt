TURDGOBBLER'S DECK NAME COLOURIFIER — ULTIMATE VERSION

STATUS
This folder is the source of the Ultimate build published at /ultimate/.
Version 6 remains the standard /colour/ release and Version Lite remains
shelved.

QUICK START
1. Keep every file in this folder together.
2. Open index.html in a modern browser.
3. Type a deck name.
4. Drag the Colour or FX reservoir onto a character—or tap a reservoir and then
   tap the character.
5. Choose the exact colour, effect, or sprite from the submenu that opens at
   that locked position.
6. Use the FX lane above the name and the colour lane below it to reposition or
   inspect layers.
7. Click Copy Name, then paste into Magic: The Gathering Arena.

THE ONE-TUBE MODEL
- The live deck name is the canvas and remains visible beside every source menu
  on desktop.
- The Mega Tube is the only positioned editor and surrounds the live name.
- Colour bubbles live on the colour lane.
- Positioned effects and sprites live on the FX lane.
- Global effects appear as chips above both lanes.
- Every colour bubble, including bubble 1 and a single remaining bubble, is
  freely movable by pointer and keyboard.
- Click a rendered character to move the active caret. On touch, tap Colour or
  FX and then a rendered character or the end slot.
- Desktop dragging resolves against actual rendered character geometry.
- Positioned bubbles support Arrow keys, Shift+Arrow, Page Up/Down, Home, End,
  Delete, and Backspace.
- Selecting any tube layer opens one nearby inspector for editing, duplication,
  and deletion.
- Undo and Redo cover direct manipulation, source insertion, presets, and reset.

THE THREE PRESET SYSTEMS
1. WUBRG ENGINE searches and applies Magic colour identities.
2. COLOUR PRESETS applies curated colour recipes.
3. STYLIZED PRESETS applies compact colour-and-FX recipes.

WUBRG and Colour Presets replace only the colour layer. Stylized Presets replace
the previous stylized recipe while preserving manually positioned effects and
sprites. Ice Rainbow and Sunset are colour-led; Bubbles, Drift Away, Matrix
Glitch, and Upside Down combine Arena-supported tags and colours.

COLOUR + EFFECT SOURCES
- The Layer Dock has exactly two draggable creation points: Colour and FX.
- Dropping one locks its character position before opening the matching picker.
- The colour picker offers the wheel, hex, swatches, and saved palettes. The FX
  picker offers whole-name or positioned effects and all sprites.
- Full colour wheel, custom hex input, native colour picker, and fast swatches.
- Rotate, flip, save, reapply, and delete browser-local palettes.
- Global or positioned italic, underline, strike, sup, sub, size, character
  spacing, rotation, vertical offset, and horizontal position.
- Global ALL CAPS costs zero tag characters.
- Positioned line break, mono spacing, spacing, highlight, and alpha effects.
- Arena sprites 0 through 15 are kept in a submenu inside Effects.
- The Bubbles, Drift Away, Matrix Glitch, and Upside Down recipes use compact
  tag combinations that fit the default deck name within Arena's 64-character
  budget.

ULTIMATE COMPILER
- Arena's raw deck-name limit is 64 characters.
- The budget is exact: TEXT + COLOUR + FX = TOTAL / 64.
- Explicit FX remain intact; colour stages reduce first when necessary.
- A moved first visual colour still supplies Arena's required start-of-name
  colour without forcing its bubble back to zero.
- Inline events preserve caret position and literal sequence.
- Raw Arena code remains visible in the Advanced drawer.

PREVIEW + PRIVACY
- The live name canvas uses a fully opaque black background in every interaction
  state.
- Presets preview directly on the live name before commit.
- Selecting a layer highlights the characters it currently affects.
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
