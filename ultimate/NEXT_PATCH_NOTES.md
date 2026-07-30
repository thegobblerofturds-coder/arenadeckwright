# Ultimate Version — name-canvas rebuild record

## 2026-07-29: one live-name Mega Tube

The Ultimate development source was rebuilt around one editing surface.

### Fixed

- Removed the hidden normalization rule that forced the leftmost colour back to
  zero after every interaction.
- Bubble 1 and a single remaining colour bubble now retain their requested
  positions.
- Arena serialization still emits the required start-of-name colour while the
  visual bubble remains free.

### Rebuilt

- One Mega Tube with the live deck name as its permanent editing canvas.
- Exact character-aware mouse, pen, and touch drops.
- Separate visual lanes for positioned FX above and colours below the name.
- One inspector for colour, FX, sprite, and global-style layers.
- Contextual colour and effect overlays that appear only after a bubble drop or
  placed-layer selection.
- Full wheel, hex input, swatches, rotate, flip, and saved palettes.
- Three isolated preset systems: WUBRG, Colour Presets, and Stylized Presets.
- Layer-safe preset application: colour recipes do not reset effects; style
  recipes do not reset manually positioned FX or sprites.
- Ice Rainbow, Sunset, Bubbles, Drift Away, Matrix Glitch, and Upside Down
  compound recipes with live pre-commit preview.
- WUBRG identity search across one- through five-colour identities.
- Sprite submenu inside the Effects source panel.
- Selected-character highlighting and budget-trimmed colour ghosts.
- Undo and Redo for every material editing action.

### Streamlined after hands-on feedback

- Reduced the persistent editor height so the name, both layer lanes, history,
  and budget fit together more comfortably.
- Replaced oversized source bubbles with a compact five-item source dock.
- Moved tool panels into a stable contextual overlay with its own scrolling so
  opening a menu does not reflow the editor.
- Removed the empty inspector placeholder; the contextual editor appears only
  after a layer is selected and now has a direct close control.
- Removed source-then-character arming. Pointer creation is now one direct drag
  from either side bubble into the live name.
- Simplified effect instructions around the two real actions: choose for the
  dropped position or APPLY ALL.

### Two-reservoir layer dock

- Replaced the five creation buttons with two draggable reservoirs: Colour and
  FX.
- Dropping either reservoir anywhere on the live name locks that exact caret
  and opens only its matching submenu.
- Choosing a swatch, custom colour, effect, or sprite commits it to the locked
  position and closes the picker.
- The same pointer-drag flow now handles mouse, pen, and touch. Enter or Space
  places a focused reservoir at the active caret for keyboard access.
- WUBRG, Colour Presets, and Stylized Presets remain as a separate compact
  three-item shelf.
- Reauthored Bubbles, Drift Away, Matrix Glitch, and Upside Down with fewer
  high-impact tags. Every stylized preset now fits `Your Deck Name` at or below
  Arena's 64-character limit.

### Context-only chrome

- Kept one Colour bubble on the left and one FX bubble on the right of the Mega
  Tube; there is no persistent source dock.
- Clicking a placed colour, effect, sprite, or global style reopens its matching
  menu with the layer inspector attached.
- WUBRG, Colour Presets, and Stylized Presets are three tiny launchers below the
  tube and expand into the same compact overlay.
- Budget details, history, Clear FX, Start Over, and raw Arena code now live
  behind one `•••` More disclosure.

### Removed from the product surface

- Alternate/prismatic duplicate name view.
- Separate inline-event timeline and duplicate FX drawer.
- Separate palette drawer, quick-palette strip, and MTG station.
- Modal two-stage FX picker and colour-wheel modal.
- Candidate-probe Arena Lab and unsafe font/material probe UI.
- Retired timeline renderer and the accumulated compatibility branches tied to
  those surfaces.

The exact compiler, 64-character budget, opaque-black Arena Mirror, verified
effects, sprite mapping, local font, copy fallback, raw-code view, offline
operation, reduced-motion support, and fan-content notice remain.

## Release status

This live-name Ultimate build is the `/ultimate/` release line. `/colour/`
remains Version 6 and Version Lite remains shelved.
