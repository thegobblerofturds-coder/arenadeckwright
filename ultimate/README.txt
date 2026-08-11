TURDGOBBLER'S DECK NAME COLOURIFIER — ULTIMATE VERSION

STATUS
This folder is the active Ultimate source. The current published build is
ultimate-7.14.
Version 6 remains the standard /colour/ release and Version Lite remains
shelved.

CURRENT INTERACTION PASS
The public prototype now uses a Looks-first progressive dock. Looks is the
quick-start route; Colour, FX, and Sprite explain themselves when tapped while
retaining direct drag placement.

The public Ultimate route is deliberately labelled PROTOTYPE while its denser
interaction model is still being refined. A quiet footer invitation links to
TurdGobbler's Twitch channel for hands-on feedback.

Supported devices now add crunchy haptic feedback to presses, layer pickup,
character and centre snapping, committed drops, copy, undo/redo, errors, and
deletion. Browsers without the Web Vibration API continue without vibration.

QUICK START
1. Keep every file in this folder together.
2. Open index.html in a modern browser.
3. Type a deck name.
4. Drag Colour, FX, or Sprite anywhere across the tube. Colour uses that exact
   point; FX and Sprite compile at the text insertion point shown by the guide
   line. Keyboard users can place any source bubble with Enter or Space.
5. Finish the drop in the prominent full-screen chooser. Colour stays staged
   until the green top confirmation is pressed; FX and Sprite land after an
   exact choice is made.
6. Drag any bubble on the shared rail to reposition it, or click it to inspect
   and change it.
7. Click Copy, then paste into Magic: The Gathering Arena.

THE ONE-TUBE MODEL
- The live deck name is the canvas. An unfinished Colour or FX drop opens a
  deliberately prominent completion sheet. Later refinement stays compact;
  Looks and WUBRG open below the tube with a pinned, exact-black live result.
- The Mega Tube is the only positioned editor. The name stays above one shared
  horizontal rail for colour, positioned FX, and sprites.
- On mobile, the whole-name controls sit beside the shortened black tube while
  the four-door dock stays directly below it.
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
- A fixed four-column action row aligns beneath the four main doors: a split
  Undo/Redo history cell, Clear FX, Start Over, and the direct Saved shortcut.
  More opens an information-only dialog for budget and layer counts.

THE FOUR PRIMARY DOORS
1. LOOKS is the quick-start door and opens the ready-made Colour and Special
   collections immediately.
2. COLOUR can still be dragged directly onto the name. A tap expands a short
   explanation with Add at Centre and WUBRG as the instant mana-look route.
3. FX can be dragged onto a letter or sprite. A tap explains the purple-letter
   and gold-sprite guides and offers Add at Centre.
4. SPRITE can be dragged to its exact insertion point. A tap explains placement
   and offers Add at Centre.

WUBRG previews Magic colour identities live as pips are selected, then keeps
   or cancels the whole session from the top action bar. Stable compact rows
   keep two-, three-, and four/five-colour identities from jumping as the
   selection changes. Multi-colour identities divide the deck-name letters
   evenly by default and rebalance when the name changes.
LOOKS opens below the tube with Special and Colour in one lifted upper arc.
   Colour contains Ice, Prismatic, Sunset Relic, and Toxic Foil. Special
   contains Upside Down, Bubbles, Drift Away, and Matrix Glitch. The direct
   Saved button provides four fixed complete-look slots that can be previewed,
   renamed, deleted, or saved over. Inside a collection the centre becomes a
   red Back button.

WUBRG and Colour presets replace only the colour layer. Special replaces
non-sprite FX predictably while preserving sprites. Saved slots capture and
restore the complete composition.

COLOUR + EFFECT + SPRITE SOURCES
- The focused dock has four clear doors, with Looks first and the three
  draggable creation points beside it: Colour, FX, and Sprite.
- A Colour drop locks an exact edge-to-edge point; an FX drop locks a text
  position before opening the matching picker.
- All four doors remain together and reachable on narrow mobile screens.
- The colour picker offers the wheel, hex, swatches, and saved palettes. The FX
  picker nests Motion, Text, Transform, and Visual families around one circle;
  choosing a family replaces it with only that family’s compact effect samples.
  Sprites have their own focused picker.
- Both the full colour wheel and the compact wheel inside a selected colour’s
  editing bay have a live thumb-preview tile and hex readout.
- The V6 circular colour disc is the primary mobile picker: white at its centre,
  full colour through the middle, and a dark outer ring. The native mobile
  colour swatch is hidden.
- The drop magnifier shows a plain Left/Centre/Right colour position or an FX
  text position. User-facing tube-position percentages are intentionally hidden.
- All Caps and Small Caps are direct whole-name toggles. Italic, Underline,
  Strike, Superscript, Subscript, Size, Spacing, Rotate, and Offset are normal
  positioned FX choices. Bold is intentionally absent because Arena no longer
  displays its tag.
- FX demonstrations are sized to fit their nested circular buttons.
- Dragging an existing layer creates a floating copy that follows the pointer
  and reveals a full-width red delete bar directly below the tube.
- The four most recently used colours appear first.
- Rotate, flip, save, reapply, and delete browser-local palettes.
- Global or positioned italic, underline, strike, sup, sub, size, character
  spacing, rotation, vertical offset, and horizontal position.
- Global ALL CAPS costs zero tag characters.
- Positioned line break, mono spacing, spacing, highlight, and alpha effects.
- Arena sprites 0 through 15 are kept in their own Sprite picker.
- Sprites inherit meaningful active FX such as size, rotation, offsets,
  spacing, highlight, and alpha alongside the surrounding text. Text-only
  lettering effects remain on text.
- Force Gradient samples every chosen colour into as many smooth Arena colour
  stages as the 64-character budget and deck-name length can support.
- Copy is available both beside the name input and on the live black display;
  successful copies raise a light, coloured COPIED! confirmation.

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
- Mobile places WUBRG and Presets beside a shortened black tube. Their bounded
  bottom sheet rises beneath the still-visible result instead of beginning
  below the rest of the editor; the redundant display Copy is hidden there.
- Presets preview on the pinned live result before commit. Keep confirms the
  staged look, Cancel restores the prior look, and clicking away keeps it.
- Selecting a layer highlights only its own rail bubble, never the name text.
- Saved Presets capture the full deck name, colours, whole-name toggles,
  positioned FX, and sprites on this device. Save, Load, Rename, and Delete are
  nested inside the Saved collection.
- The WUBRG panel has no Clear button. Tapping pips toggles them; tapping the
  active identity cycles its colour order. Four-colour identities use
  `4 COLOUR (HISTORICAL NAME)` labels. Matching identities replace the old
  redundant Identity readout.
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
