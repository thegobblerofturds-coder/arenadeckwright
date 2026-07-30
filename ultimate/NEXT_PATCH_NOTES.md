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
- Exact character-aware desktop drops plus tap-source, tap-character placement.
- Separate visual lanes for positioned FX above and colours below the name.
- One inspector for colour, FX, sprite, and global-style layers.
- Collapsible colour and effect source menus.
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
- Kept desktop tool panels at a stable height with their own scrolling rather
  than making the page jump as menus change.
- Removed the empty inspector placeholder; the contextual editor appears only
  after a layer is selected and now has a direct close control.
- Mobile source menus collapse automatically after arming a colour, effect, or
  sprite so the next required tap—the target character—is immediately visible.
- Simplified effect instructions around the two real actions: APPLY ALL or
  place from a character.

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
