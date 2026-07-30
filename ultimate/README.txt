TURDGOBBLER'S DECK NAME COLOURIFIER — ULTIMATE VERSION

STATUS
This folder is the active Ultimate source. The v6.4 placement-context interface
is the release published at /ultimate/ on 2026-07-30.
Version 6 remains the standard /colour/ release and Version Lite remains
shelved.

QUICK START
1. Keep every file in this folder together.
2. Open index.html in a modern browser.
3. Type a deck name.
4. Drag either Colour or FX anywhere across the tube. Colour uses that exact
   point; FX compiles at the text insertion point shown by its guide line.
   Keyboard users can place either bubble with Enter or Space.
5. Finish the drop in the prominent full-screen chooser. The bubble is not
   placed until an exact colour, effect, or sprite is chosen.
6. Drag any bubble on the shared rail to reposition it, or click it to inspect
   and change it.
7. Click Copy, then paste into Magic: The Gathering Arena.

THE ONE-TUBE MODEL
- The live deck name is the canvas. An unfinished Colour or FX drop opens a
  deliberately prominent completion sheet. Later refinement, WUBRG, and Preset
  choices use a quieter bounded panel below the tube.
- The Mega Tube is the only positioned editor. The name stays above one shared
  horizontal rail for colour, positioned FX, and sprites.
- Global whole-name styles stay inside the top edge of the same black tube.
- Every colour bubble, including bubble 1 and a single remaining bubble, is
  freely movable by pointer and keyboard.
- Clicking a rendered character silently updates the keyboard insertion point.
- Mouse, pen, and touch bubbles move continuously across the rail. FX retains a
  separate compiled text offset. Every dotted guide terminates at the actual
  rendered character affected by that offset.
- Positioned bubbles support Arrow keys, Shift+Arrow, Page Up/Down, Home, End,
  Delete, and Backspace.
- Dropping or moving a layer leaves the editor closed. Tapping a placed bubble
  opens its compact nearby editor; Change Colour or Change FX opens the full
  contextual menu only when needed.
- Numeric FX values and tube positions use draggable range controls with live
  name feedback.
- Effects sharing one character remain separate clickable bubbles. Collision
  spacing keeps them accessible, and guide lines point back to their exact
  text anchors.
- Selecting a layer never draws decoration across the affected letters.
- Undo and Start Over stay permanently visible. More contains Redo, budget
  details, Clear FX, and complete saved presets.

THE TWO PRESET LAUNCHERS
1. WUBRG applies Magic colour identities immediately as pips are selected.
2. PRESETS contains both curated colour recipes and combined colour-and-FX
   looks.

WUBRG and colour recipes replace only the colour layer. Combined Presets replace
the current non-sprite FX so every named look is deterministic while preserving
inline sprites. Ice Rainbow and Sunset are colour-led; Bubbles, Drift Away,
Matrix Glitch, and Upside Down combine Arena-supported tags and colours.

COLOUR + EFFECT SOURCES
- The Layer Dock has exactly two draggable creation points, paired directly
  beneath the tube: Colour and FX.
- A Colour drop locks an exact edge-to-edge percentage; an FX drop locks a text
  position before opening the matching picker.
- The two bubbles sit directly beside the Mega Tube and remain reachable on
  narrow mobile screens.
- The colour picker offers the wheel, hex, swatches, and saved palettes. The FX
  picker offers whole-name or positioned effects and all sprites.
- The V6 circular colour disc is the primary mobile picker: white at its centre,
  full colour through the middle, and a dark outer ring. The native mobile
  colour swatch is hidden.
- The drop magnifier shows either an exact colour percentage or an FX text
  position. Both bubble types move continuously to the absolute tube edges.
- All Caps and Small Caps are direct whole-name toggles. Bold, Italic,
  Underline, Strike, Superscript, Subscript, Size, Spacing, Rotate, and Offset
  are normal positioned FX choices.
- Dragging an existing layer creates a floating copy that follows the pointer
  and reveals a full-width red delete bar directly below the tube.
- The four most recently used colours and positioned effects appear first.
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
- Inline events preserve text position and literal sequence.
- Raw Arena code is generated internally for Copy but is not exposed as editor
  chrome.

PREVIEW + PRIVACY
- The live name canvas uses a fully opaque black background in every interaction
  state.
- Presets preview directly on the live name before commit.
- Selecting a layer highlights only its own rail bubble, never the name text.
- Saved Presets in More capture the full deck name, colours, whole-name
  toggles, positioned FX, and sprites on this device.
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

RECOVERABLE SNAPSHOT
The complete pre-rebuild v5.1 local interface is preserved in
../archives/turdgobbler-colourifier-ultimate-v5.1-local-snapshot.zip.
